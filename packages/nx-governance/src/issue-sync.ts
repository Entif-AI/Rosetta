import Ajv from 'ajv';
import { digest } from './source-evidence';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Nx's CommonJS source loader.
import schema = require('./issue-sync.schema.json');

export interface TaskProjection {
  id: string; title: string; body: string; issueNumber: number | null; sourceRef: string;
  findingRefs: string[]; originTaskIds: string[];
  decision: { kind: 'split' | 'merge'; ref: string } | null;
  closedDisposition: 'retain' | null;
  disposition?: 'active' | 'deferred';
  retryRef?: string;
}
export interface TaskSyncRequest {
  formatVersion: 1; repository: string; featureId: string; publicationPosture: 'public'; tasks: TaskProjection[];
}
export interface IssueSnapshot { number: number; title: string; body: string; state: 'open' | 'closed' }
export interface TaskBinding {
  bindingId: string; marker: string; taskId: string; state: 'pending' | 'bound'; issueNumber: number | null;
  taskDigest: string; sourceRef: string; findingRefs: string[]; originTaskIds: string[];
  consumedRetryRefs: string[]; decision: TaskProjection['decision']; status: 'active' | 'removed-projection' | 'deferred-projection';
}
export interface TaskLedger { formatVersion: 1; repository: string; featureId: string; bindings: Record<string, TaskBinding> }
type IssueClient = { get: (number: number) => Promise<IssueSnapshot>; find: (marker: string) => Promise<IssueSnapshot[]>;
  create: (title: string, body: string) => Promise<IssueSnapshot> };
type LedgerStore = { load: () => TaskLedger | undefined; save: (ledger: TaskLedger) => void };
type ActionKind = 'bound' | 'recovered' | 'propose-create' | 'created' | 'delivery-unknown' | 'conflict' | 'closed-owner' | 'removed-projection' | 'deferred-projection';
const validate = new Ajv({ allErrors: true }).compile<TaskSyncRequest>(schema);
const validateLedger = new Ajv({ allErrors: true }).compile<TaskLedger>({ definitions: schema.definitions, $ref: '#/definitions/ledger' });
const identity = (repository: string, feature: string, task: string) => digest(`${repository.toLowerCase()}\0${feature}\0${task}`);
const markerFor = (id: string) => `<!-- entif-task-binding:${id} -->`;

/** Durable GitHub identity outranks task prose. External mutation is explicitly coordinator-owned. */
export async function synchronizeTasks(input: unknown, client: IssueClient, store: LedgerStore, apply = false) {
  if (!validate(input)) throw new Error(`Invalid task projection: ${JSON.stringify(validate.errors)}`);
  if (new Set(input.tasks.map((task) => task.id)).size !== input.tasks.length) throw new Error('Duplicate task identity.');
  const repository = input.repository.toLowerCase();
  const stored = store.load();
  if (stored && !validateLedger(stored)) throw new Error(`Malformed durable ledger: ${JSON.stringify(validateLedger.errors)}`);
  const ledger: TaskLedger = structuredClone(stored ?? { formatVersion: 1, repository, featureId: input.featureId, bindings: {} });
  if (ledger.formatVersion !== 1 || ledger.repository !== repository || ledger.featureId !== input.featureId || !ledger.bindings || typeof ledger.bindings !== 'object' || Array.isArray(ledger.bindings)) throw new Error('Ledger authority/identity conflict.');
  for (const [id, binding] of Object.entries(ledger.bindings)) {
    const expected = identity(repository, input.featureId, id);
    if (!/^T[0-9]{3,}$/.test(id) || !binding || binding.taskId !== id || binding.bindingId !== expected || binding.marker !== markerFor(expected) ||
        !['pending', 'bound'].includes(binding.state) || (binding.state === 'pending' ? binding.issueNumber !== null : !Number.isInteger(binding.issueNumber) || binding.issueNumber! < 1) ||
        !/^[a-f0-9]{64}$/.test(binding.taskDigest) || !Array.isArray(binding.findingRefs) || !Array.isArray(binding.originTaskIds)) throw new Error(`Malformed durable binding: ${id}`);
  }
  const actions: { taskId: string; kind: ActionKind; issueNumber?: number; reason?: string }[] = [];
  const save = () => { if (apply) store.save(ledger); };
  const tasks = new Map(input.tasks.map((task) => [task.id, task]));
  const conflicts = new Map<string, string>();
  const conflict = (id: string, reason: string) => conflicts.set(id, reason);
  if (JSON.stringify(input.tasks).includes('entif-task-binding:')) throw new Error('Reserved binding marker namespace in task content.');
  const numbers = new Map<string, number | null>();
  for (const binding of Object.values(ledger.bindings)) numbers.set(binding.taskId, binding.issueNumber);
  for (const task of input.tasks) {
    const previous = ledger.bindings[task.id];
    numbers.set(task.id, previous?.issueNumber ?? task.issueNumber);
    if (previous?.originTaskIds.some((id) => !task.originTaskIds.includes(id))) conflict(task.id, 'Durable original task lineage cannot be discarded.');
    if (previous?.issueNumber && task.issueNumber && previous.issueNumber !== task.issueNumber) conflict(task.id, 'Existing durable issue identity wins.');
    if (task.originTaskIds.some((id) => id === task.id || !tasks.has(id) && !ledger.bindings[id]) ||
        task.originTaskIds.length && !['split', 'merge'].includes(task.decision?.kind ?? '') ||
        task.decision?.kind === 'split' && !task.originTaskIds.length) conflict(task.id, 'Explicit traceable split/merge reconciliation is required.');
  }
  // Original task lineage is acyclic and resolved before dependent execution.
  const ordered: TaskProjection[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (task: TaskProjection) => {
    if (visiting.has(task.id)) { conflict(task.id, 'Cyclic task lineage.'); return; }
    if (visited.has(task.id)) return;
    visiting.add(task.id);
    for (const id of task.originTaskIds) { const origin = tasks.get(id); if (origin) visit(origin); }
    visiting.delete(task.id); visited.add(task.id); ordered.push(task);
  };
  input.tasks.forEach(visit);
  const validMappings = () => {
    const groups = new Map<number, string[]>();
    for (const [id, number] of numbers) if (number) groups.set(number, [...(groups.get(number) ?? []), id]);
    for (const ids of groups.values()) {
      if (ids.length < 2) continue;
      const participants = ids.map((id) => tasks.get(id) ?? ledger.bindings[id]);
      const ref = participants[0].decision?.ref;
      const declared = new Set(participants.flatMap((entry) => entry.originTaskIds));
      if (!ref || participants.some((entry) => entry.decision?.kind !== 'merge' || entry.decision.ref !== ref) ||
          !declared.size || participants.some((entry) => entry.originTaskIds.some((id) => !ids.includes(id))) ||
          ids.some((id) => !declared.has(id) && !participants.some((entry) => entry.originTaskIds.length && ('id' in entry ? entry.id : entry.taskId) === id))) {
        ids.forEach((id) => conflict(id, 'Many-to-one owners require a shared merge decision and declared participant lineage.'));
      }
    }
    for (const task of input.tasks) {
      const number = numbers.get(task.id);
      if (task.decision?.kind === 'merge' && (!number || ![...numbers].some(([id, owner]) => id !== task.id && owner === number))) conflict(task.id, 'Merge requires multiple declared participants with one durable owner.');
      if (task.decision?.kind === 'split' && task.originTaskIds.some((id) => number && numbers.get(id) === number)) conflict(task.id, 'Split requires distinct durable owners.');
    }
  };
  validMappings();
  const resolved = new Map<string, { issue?: IssueSnapshot; kind: ActionKind }>();
  const assertIssue = (issue: IssueSnapshot) => {
    if (!Number.isInteger(issue.number) || issue.number < 1 || !['open', 'closed'].includes(issue.state) || typeof issue.body !== 'string') throw new Error('Malformed issue receipt.');
  };
  // Resolve all identities before any write/send, including collisions discovered by recovery.
  if (!conflicts.size) for (const task of ordered) {
    const previous = ledger.bindings[task.id];
    const number = numbers.get(task.id);
    const marker = markerFor(identity(repository, input.featureId, task.id));
    let issue: IssueSnapshot | undefined;
    let kind: ActionKind = 'bound';
    if (number) {
      issue = await client.get(number); assertIssue(issue);
      if (issue.number !== number) throw new Error('Issue receipt identity conflict.');
      if (previous?.state === 'pending' && !issue.body.includes(marker)) conflict(task.id, 'Pending delivery can resolve only by exact binding marker.');
    } else if (task.disposition !== 'deferred' || previous?.state === 'pending') {
      const matches = (await client.find(marker)).filter((entry) => entry.body.includes(marker));
      if (matches.length > 1 || matches.length && previous?.state !== 'pending') conflict(task.id, 'Binding marker has no unique pending-delivery proof; explicit reconciliation is required.');
      else if (matches.length === 1) { issue = matches[0]; assertIssue(issue); kind = 'recovered'; numbers.set(task.id, issue.number); }
      else if (previous?.state === 'pending' && (task.disposition === 'deferred' || !(task.retryRef && !previous.consumedRetryRefs.includes(task.retryRef)))) kind = 'delivery-unknown';
      else kind = 'propose-create';
    }
    resolved.set(task.id, { issue, kind });
  }
  for (const task of input.tasks) for (const id of task.originTaskIds) {
    const number = numbers.get(id);
    if (!number) continue;
    const original = resolved.get(id)?.issue ?? await client.get(number);
    assertIssue(original);
    if (original.number !== number) throw new Error('Original issue receipt identity conflict.');
    if (original.state === 'closed' && tasks.get(id)?.closedDisposition !== 'retain') conflict(task.id, 'Original closed owner requires explicit retained disposition before reconciliation.');
  }
  validMappings();
  if (conflicts.size) return { role: 'task-work-identity-not-semantic-authority', ledger,
    actions: [...conflicts].map(([taskId, reason]) => ({ taskId, kind: 'conflict' as const, reason })), success: false };
  const findings = (task: TaskProjection): string[] => [...new Set([
    ...(ledger.bindings[task.id]?.findingRefs ?? []), ...task.findingRefs,
    ...task.originTaskIds.flatMap((id) => ledger.bindings[id]?.findingRefs ?? tasks.get(id)?.findingRefs ?? []),
  ])].sort();
  for (const task of ordered) {
    const previous = ledger.bindings[task.id];
    let { issue, kind } = resolved.get(task.id)!;
    if (task.decision?.kind === 'split' && task.originTaskIds.some((id) => ledger.bindings[id]?.state === 'pending' || !ledger.bindings[id] && apply)) {
      actions.push({ taskId: task.id, kind: 'conflict', reason: 'Resolve original task delivery before creating split work.' }); continue;
    }
    if (kind === 'delivery-unknown') { actions.push({ taskId: task.id, kind, reason: 'Resolve the exact prior delivery; never blindly create again.' }); continue; }
    if (task.disposition === 'deferred' && !issue) { actions.push({ taskId: task.id, kind: 'deferred-projection' }); continue; }
    const bindingId = identity(repository, input.featureId, task.id);
    const marker = markerFor(bindingId);
    const binding: TaskBinding = { bindingId, marker, taskId: task.id, state: previous?.state ?? 'pending',
      issueNumber: issue?.number ?? null, taskDigest: digest(JSON.stringify(task)), sourceRef: task.sourceRef,
      findingRefs: findings(task), originTaskIds: [...new Set([...(previous?.originTaskIds ?? []), ...task.originTaskIds])], decision: task.decision ?? previous?.decision ?? null,
      consumedRetryRefs: [...(previous?.consumedRetryRefs ?? []), ...(previous?.state === 'pending' && task.retryRef && !previous.consumedRetryRefs.includes(task.retryRef) ? [task.retryRef] : [])],
      status: task.disposition === 'deferred' ? 'deferred-projection' : 'active' };
    if (!issue) {
      if (!apply) { actions.push({ taskId: task.id, kind: 'propose-create' }); continue; }
      // Consume authorization durably before a send. Ack loss preserves pending identity.
      ledger.bindings[task.id] = binding; save();
      try {
        const lineage = binding.findingRefs.length ? `\n\nSource findings: ${binding.findingRefs.join(', ')}` : '';
        issue = await client.create(task.title, `${task.body}\n\nTask source: ${task.sourceRef}${lineage}\n\n${marker}`);
        assertIssue(issue);
        if (!issue.body.includes(marker) || [...numbers].some(([id, number]) => id !== task.id && number === issue!.number)) throw new Error('Creation receipt identity conflict.');
        numbers.set(task.id, issue.number); kind = 'created';
      } catch { actions.push({ taskId: task.id, kind: 'delivery-unknown', reason: 'Send acknowledgement unavailable; reconcile exact binding before retry.' }); continue; }
    }
    binding.issueNumber = issue.number; binding.state = 'bound'; ledger.bindings[task.id] = binding; save();
    actions.push({ taskId: task.id, kind: issue.state === 'closed' && task.closedDisposition !== 'retain' ? 'closed-owner' : task.disposition === 'deferred' ? 'deferred-projection' : kind, issueNumber: issue.number });
  }
  const active = new Set(input.tasks.map((task) => task.id));
  for (const binding of Object.values(ledger.bindings).filter((entry) => !active.has(entry.taskId))) {
    binding.status = 'removed-projection';
    actions.push({ taskId: binding.taskId, kind: 'removed-projection', ...(binding.issueNumber ? { issueNumber: binding.issueNumber } : {}) });
  }
  save();
  return { role: 'task-work-identity-not-semantic-authority', ledger, actions,
    success: !actions.some((action) => ['delivery-unknown', 'conflict', 'closed-owner'].includes(action.kind)) };
}
