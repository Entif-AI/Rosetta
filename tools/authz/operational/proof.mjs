import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import console from 'node:console';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { buildTile, verifyTileIntegrity } from '../../../packages/rosetta-core/dist/index.js';
import { validatePayload } from '../../../packages/rosetta-schemas/dist/index.js';
import { buildReceiptBundle, createReceipt, createSigningKeyPair, signReceiptEd25519, verifyReceiptBundle, verifySignedReceipt } from '../../../packages/rosetta-receipts/dist/index.js';
import { InMemoryTileStore } from '../../../packages/rosetta-store/dist/index.js';
import { LocalAuthorityState, SignedActorEvidenceRegistry, createWorkloadActorAssertion, ConfiguredRootAuthoritySource, GovernedAuthorityMutator, LocalAdmissionJournal, LocalWriteAdmission, LocalCredentialMediator, LocalReferenceProvider, authorizeCurrentOperation } from '../../../packages/rosetta-guard/dist/index.js';

const require = createRequire(import.meta.url);
const { createRosettaApiServer } = require('../../../apps/rosetta-api/dist/apps/rosetta-api/src/lib/rosetta-api.js');
const allowedKinds = new Set(['rosetta.run', 'rosetta.action', 'rosetta.observation', 'rosetta.evaluation', 'rosetta.receipt', 'iam.decision', 'workflow.policy_decision']);
const json = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]);
}
function workflow(ref, adapterId, capabilityFamily, effectClass) {
  return { evaluatedAt: ref.now, policy: { policyId: ref.policyRef }, policySnapshotId: ref.policyRef, startupGrantSnapshotId: ref.startupRef,
    startupProfile: { allowedAdapters: [adapterId], allowedCapabilityFamilies: [capabilityFamily], allowedEffectClasses: [effectClass] },
    workflow: { artifactId: 'bound-at-admission', requestedAdapters: [{ adapterId, capabilityFamily }], requestedEffects: [{ effectClass, effectTier: 'bounded' }] } };
}
function anchor(issuerRef, keyId, publicKeyPem, journal) {
  const tile = journal.persist(buildTile('rosetta.observation', { observationId: keyId, source: issuerRef, signal: 'Host-installed public trust anchor', publicKeyPem }));
  return { issuerRef, keyId, publicKeyPem, anchorRef: tile.cid };
}
function signedAssertion(tile, type, key, trust) {
  const receipt = createReceipt({ receiptType: `${type}.v1`, policyRefs: [trust.anchorRef], subjects: [{ cid: tile.cid }], digests: [],
    claims: [{ claimType: type, statement: 'Pinned host source attests this exact witness; attestation does not grant rights.', verdict: 'pass', evidence: [{ cid: tile.cid }] }] });
  return signReceiptEd25519(receipt, key.privateKey, key.publicKeyPem, trust.keyId);
}
function closeEvidence(journal) {
  const tiles = journal.all(); const store = new InMemoryTileStore();
  for (const tile of tiles) {
    assert.ok(allowedKinds.has(tile.kind), `UNEXPECTED_KIND:${tile.kind}`);
    assert.ok(verifyTileIntegrity(tile).ok && validatePayload(tile.kind, tile.payload).ok, `PROOF_ARTIFACT_INVALID:${tile.cid}`);
    store.put(tile);
  }
  const receipts = tiles.filter(tile => tile.kind === 'rosetta.receipt');
  for (const receipt of receipts) assert.ok(verifyReceiptBundle(buildReceiptBundle(receipt), store).ok, `PROOF_CLOSURE_MISSING:${receipt.cid}`);
  for (const tile of tiles) for (const parent of tile.parents) assert.ok(store.has(parent), `PROOF_CLOSURE_MISSING:${parent}`);
  return { artifacts: tiles.length, lifecycleReceipts: receipts.filter(tile => tile.payload.receiptType === 'rrp:lifecycle.v1').length,
    authenticatedReceipts: receipts.filter(tile => tile.payload.receiptType !== 'rrp:lifecycle.v1').length, kinds: [...new Set(tiles.map(tile => tile.kind))].sort(), schemaAndIntegrity: 'pass', receiptClosure: 'pass', parentClosure: 'pass' };
}

/** Executes exported operational components; it imports no v0.1 fixture adapter. */
export async function runOperationalProof(directory) {
  directory = resolve(directory); mkdirSync(directory, { recursive: true }); assert.equal(readdirSync(directory).length, 0, 'PROOF_DIRECTORY_NOT_EMPTY');
  const now = new Date().toISOString(); const notBefore = new Date(Date.parse(now) - 60_000).toISOString(); const expiresAt = new Date(Date.parse(now) + 86_400_000).toISOString();
  const journal = new LocalAdmissionJournal(join(directory, 'evidence')); const admission = new LocalWriteAdmission(journal);
  const subjectRef = 'urn:actor:controlled-workload';
  const target = { resourceRef: 'urn:resource:local-operational-proof', domainRef: { tenantId: 'controlled-proof', classification: 'internal', abacLabels: [] } };
  const actorKey = createSigningKeyPair(); const actorAnchor = anchor('urn:issuer:workload-owner', 'workload.ed25519.1', actorKey.publicKeyPem, journal);
  const binding = { sessionRef: 'urn:session:operational-proof', workloadRef: subjectRef, sourceFrontierRef: 'urn:authn:controlled-frontier:1' };
  const assertion = createWorkloadActorAssertion({ ...binding, subjectRef, issuerRef: actorAnchor.issuerRef, keyId: actorAnchor.keyId, methodRef: 'rrp.ed25519-receipt.v1', issuedAt: now, notBefore, expiresAt });
  const signedActor = signedAssertion(assertion, 'authz.actor-authentication', actorKey, actorAnchor);
  const actors = new SignedActorEvidenceRegistry([actorAnchor], binding); const actorEvidence = actors.bind(assertion, signedActor);
  for (const tile of [assertion, signedActor.receipt, actorEvidence]) journal.persist(tile);
  assert.equal(actors.resolve(subjectRef, [actorEvidence.cid], now).ok, true);
  const state = new LocalAuthorityState(join(directory, 'authority'), actors);
  assert.equal(state.resolve({ authorityRefs: ['urn:authority:standing'], subjectRef, now }).ok, false, 'AUTHENTICATION_MUST_NOT_GRANT');
  const operatorKey = createSigningKeyPair(); const operatorAnchor = anchor('urn:issuer:operator-owner', 'operator.ed25519.1', operatorKey.publicKeyPem, journal);
  const mutationPowers = ['authority.grant', 'authority.delegate', 'authority.revoke', 'authority.invalidate', 'authority.supersede', 'authority.policy-update'];
  const policyTile = journal.persist(buildTile('rosetta.observation', { observationId: 'reference-policy', source: 'urn:host:operational-proof', signal: 'Host-installed reference policy binding', authorityRole: 'policy-binding-evidence' }));
  const policy = { ref: policyTile.cid, version: '1', frontierRef: policyTile.cid };
  const sourceScope = { target, operations: ['A', 'A2', 'B', ...mutationPowers], effects: ['external-write', 'local-write'] };
  const operatorRoot = { ref: 'urn:authority:installed-operator', parentRef: null, subjectRef, scope: sourceScope, policy, contextConstraints: {}, requiredActorEvidenceRefs: [actorEvidence.cid],
    validity: { notBefore, expiresAt, state: 'valid', revocationRefs: [], invalidityRefs: [], supersededByRefs: [] }, delegation: { ceiling: sourceScope, furtherDelegation: true, depthRemaining: 4 } };
  const witness = buildTile('rosetta.observation', { observationId: 'installed-source', source: operatorAnchor.issuerRef, signal: 'Independently installed operator configuration witness', authorityRoot: operatorRoot });
  const proof = { observation: witness, signedReceipt: signedAssertion(witness, 'authz.root-source-attestation', operatorKey, operatorAnchor) };
  const configuration = { sourceRef: 'urn:configured:operational-proof:operator', anchor: operatorAnchor, root: operatorRoot };
  const rootSource = new ConfiguredRootAuthoritySource(join(directory, 'operator-source'), configuration, proof, actors);
  for (const tile of rootSource.evidence()) journal.persist(tile);
  const gateTile = journal.persist(buildTile('rosetta.observation', { observationId: 'gates', source: 'urn:host:operational-proof', signal: 'Host-controlled independent gates', safeHold: false, identitySensitiveRequired: false }));
  const startup = journal.persist(buildTile('rosetta.observation', { observationId: 'startup', source: 'urn:host:operational-proof', signal: 'Installed workflow startup narrowing', adapters: ['authz-state', 'reference-provider'], effects: ['local-write', 'external-write'] }));
  const gates = { safeHold: { active: false, evidenceRef: gateTile.cid }, identitySensitive: { required: false, satisfied: false, evidenceRef: gateTile.cid } };
  const wfRefs = { now, policyRef: policyTile.cid, startupRef: startup.cid };
  const service = new GovernedAuthorityMutator(state, rootSource, admission, { subjectRef, now: () => now, gates, workflow: workflow(wfRefs, 'authz-state', 'governed-state', 'local-write') });
  const mutations = [];
  const mutate = async input => { const result = await service.mutate(input); mutations.push({ id: input.event.id, ...result }); return result; };
  assert.equal((await mutate({ event: { id: 'policy', type: 'policy', policy } })).status, 'pass');
  const standingScope = { ...sourceScope, operations: ['A', 'A2', ...mutationPowers] };
  const standing = { ...globalThis.structuredClone(operatorRoot), ref: 'urn:authority:standing', scope: standingScope, delegation: { ceiling: standingScope, furtherDelegation: true, depthRemaining: 2 } };
  assert.equal((await mutate({ event: { id: 'standing-root', type: 'fact', fact: standing } })).status, 'pass');
  const childScope = { target, operations: ['A', 'A2'], effects: ['external-write'] };
  const child = { ...globalThis.structuredClone(standing), ref: 'urn:authority:child', parentRef: standing.ref, scope: childScope, delegation: { ceiling: childScope, furtherDelegation: false, depthRemaining: 0 } };
  const childGrant = { event: { id: 'delegated-child', type: 'fact', fact: child } }; const grantResult = await mutate(childGrant); assert.equal(grantResult.status, 'pass');
  const independent = { ...globalThis.structuredClone(standing), ref: 'urn:authority:independent-root', scope: childScope, delegation: { ceiling: childScope, furtherDelegation: false, depthRemaining: 0 } };
  assert.equal((await mutate({ event: { id: 'independent-root', type: 'fact', fact: independent } })).status, 'pass');
  const resolution = state.resolve({ authorityRefs: [child.ref], subjectRef, now }); assert.equal(resolution.ok, true); assert.ok(resolution.envelope.actorEvidenceRefs.includes(actorEvidence.cid));
  json(join(directory, 'compiled-envelope.json'), resolution.envelope);
  const credential = randomBytes(32).toString('hex'); const transportCapability = randomBytes(32).toString('hex');
  const provider = new LocalReferenceProvider(join(directory, 'provider'), credential, target, ['A', 'A2', 'B']);
  const providerScope = { ...childScope, operations: ['A', 'A2', 'B'] };
  const metadata = { providerRef: 'urn:provider:local-reference', accountRef: 'urn:account:controlled-proof', credentialHandle: 'urn:credential:private-reference-handle', target, capabilities: [providerScope], expiresAt, revoked: false };
  const mediator = new LocalCredentialMediator(state, admission, { metadata: () => metadata, resolveSecret: () => credential, adapter: provider }, { authorityRefs: [child.ref], subjectRef, target, operations: ['A', 'A2', 'B'], providerRef: metadata.providerRef, accountRef: metadata.accountRef, now: () => now, context: {}, ceilings: [], gates, workflow: workflow(wfRefs, 'reference-provider', 'bounded-provider', 'external-write') });
  const server = createRosettaApiServer({ execution: { mediator, authenticate: request => request.headers.authorization === `Bearer ${transportCapability}` && actors.resolve(subjectRef, [actorEvidence.cid], now).ok ? { subjectRef } : null } });
  const allowed = []; const denied = []; const replays = []; const responses = [];
  let discovery, amplification, revocation, oldGrantReplay, independentRoot, standingDelegation;
  await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
  try {
    const address = server.address(); assert.ok(address && typeof address !== 'string'); const url = `http://127.0.0.1:${address.port}`;
    const headers = { authorization: `Bearer ${transportCapability}`, 'content-type': 'application/json' };
    const listed = await globalThis.fetch(`${url}/authz/tools`, { headers }); assert.equal(listed.status, 200); discovery = await listed.json(); responses.push(discovery); assert.deepEqual(discovery.operations, ['A', 'A2']);
    json(join(directory, 'cached-discovery.json'), discovery);
    const call = async (intent, artifact) => {
      const before = provider.inspect(); const res = await globalThis.fetch(`${url}/authz/execute`, { method: 'POST', headers, body: JSON.stringify(intent) }); const body = await res.json(); responses.push(body); const after = provider.inspect();
      const row = { id: intent.id, operation: intent.operation, artifact, httpStatus: res.status, code: body.code, revision: body.revision, before, after, receiptRef: body.admission?.receipt.cid, evaluationRef: body.admission?.authorization?.evaluation.cid, readbackRef: body.admission?.observation?.cid };
      row.measurementRef = journal.persist(buildTile('rosetta.observation', { observationId: `effect-probe:${intent.id}`, source: 'urn:probe:real-http-provider', signal: 'Provider bytes measured across actual HTTP execution', effectProbe: row }, { parents: row.receiptRef ? [row.receiptRef] : [] })).cid;
      if (res.status === 200) { assert.equal(body.code, 'EXECUTED'); assert.equal(body.admission.effect, 'committed'); assert.ok(body.admission.checkpoint); assert.deepEqual(body.admission.steps, ['propose', 'normalize', 'authorize', 'ground', 'checkpoint', 'apply', 'observe', 'receipt', 'project']); assert.equal(after.effectCount, before.effectCount + 1); assert.notEqual(after.stateDigest, before.stateDigest); allowed.push(row); }
      else { assert.equal(res.status, 403); assert.equal(body.code, 'ENTIF_AUTHORITY_DENIED'); assert.equal(body.admission.effect, 'none'); assert.deepEqual(after, before); denied.push(row); }
      return { row, body };
    };
    const mutationCount = mutations.length; const startRevision = state.inspect().revision;
    await call({ id: 'standing-A', operation: 'A' }); await call({ id: 'standing-A2', operation: 'A2' });
    standingDelegation = { startRevision, endRevision: state.inspect().revision, authorityMutationsDuringExecution: mutations.length - mutationCount, approvalHandoffArtifacts: journal.all().filter(tile => tile.kind === 'iam.approval_handoff').length };
    assert.equal(standingDelegation.authorityMutationsDuringExecution, 0); assert.equal(standingDelegation.approvalHandoffArtifacts, 0);
    await call({ id: 'provider-supported-B', operation: 'B' });
    const beforeAmplification = state.inspect(); const providerBeforeAmplification = provider.inspect();
    const amplifiedScope = { ...childScope, operations: ['A', 'B'] }; const amplified = { ...child, ref: 'urn:authority:amplified', scope: amplifiedScope, delegation: { ...child.delegation, ceiling: amplifiedScope } };
    const amplificationResult = await mutate({ event: { id: 'amplified-delegation', type: 'fact', fact: amplified } });
    assert.equal(amplificationResult.status, 'deny'); assert.deepEqual(state.inspect(), beforeAmplification); assert.deepEqual(provider.inspect(), providerBeforeAmplification);
    amplification = { ...amplificationResult, beforeRevision: beforeAmplification.revision, afterRevision: state.inspect().revision, providerBefore: providerBeforeAmplification, providerAfter: provider.inspect() };
    const revocationEvidence = journal.persist(buildTile('rosetta.observation', { observationId: 'revoke-child', source: 'urn:host:operational-proof', signal: 'Controlled revocation intent; independent standing authority required', authorityRef: child.ref }));
    const beforeRevision = state.inspect().revision;
    const revoked = await mutate({ authorizerRef: standing.ref, event: { id: 'revoke-child', type: 'invalidity', ref: child.ref, state: 'revoked', evidenceRef: revocationEvidence.cid } });
    assert.equal(revoked.status, 'pass'); assert.equal(revoked.revision, beforeRevision + 1);
    revocation = { beforeRevision, afterRevision: revoked.revision, frontierRef: revoked.frontierRef, receiptRef: revoked.receiptRef, providerCredentialRemainsValid: !metadata.revoked && Date.parse(now) < Date.parse(metadata.expiresAt) };
    await call({ id: 'post-revoke-A', operation: 'A', minimumRevision: revoked.revision });
    const replayArtifacts = [
      ['Authority Envelope', resolution.envelope], ['allow Evaluation', journal.read(allowed[0].evaluationRef)], ['successful Receipt', journal.read(allowed[0].receiptRef)],
      ['cached discovery', discovery.discovery], ['mutation Receipt', journal.read(grantResult.receiptRef)]
    ];
    for (const [index, [artifact, value]] of replayArtifacts.entries()) {
      const { row } = await call({ id: `replay-${index}`, operation: discovery.operations[0], minimumRevision: revoked.revision,
        ...(artifact === 'cached discovery' ? {} : { submittedEnvelope: value }), evidenceRefs: [value.cid ?? value.envelopeRef] }, artifact);
      assert.ok(row.revision >= revoked.revision); replays.push(row);
    }
    const beforeOldGrant = state.inspect(); const providerBeforeOldGrant = provider.inspect(); const reconciled = await mutate(childGrant); assert.equal(reconciled.status, 'reconciled'); assert.deepEqual(state.inspect(), beforeOldGrant); assert.deepEqual(provider.inspect(), providerBeforeOldGrant);
    oldGrantReplay = { status: reconciled.status, currentRevision: reconciled.revision, historicalReceiptRef: reconciled.receiptRef, noAuthorityAppend: true, providerBefore: providerBeforeOldGrant, providerAfter: provider.inspect() };
    const surviving = authorizeCurrentOperation(state, { query: { authorityRefs: [independent.ref], subjectRef, now, minimumRevision: revoked.revision }, operation: 'A', effect: 'external-write', target, context: {}, providerCapabilities: [providerScope], ceilings: [], gates, intentRefs: [] });
    journal.persist(surviving.evaluation); assert.equal(surviving.evaluation.payload.effect, 'allow'); independentRoot = { authorityRef: independent.ref, effect: surviving.evaluation.payload.effect, revision: surviving.revision, evaluationRef: surviving.evaluation.cid };
    assert.equal(state.resolve({ authorityRefs: [child.ref], subjectRef, now, minimumRevision: revoked.revision }).ok, false);
    assert.equal(state.inspect(beforeRevision).facts.find(fact => fact.ref === child.ref).validity.state, 'valid');
  } finally { server.closeAllConnections(); await new Promise(resolveClose => server.close(resolveClose)); }
  for (const tile of state.observations()) journal.persist(tile);
  json(join(directory, 'authenticated-sources.json'), { actor: { anchor: actorAnchor, binding, assertion, signedReceipt: signedActor, evidenceRef: actorEvidence.cid }, operator: { configuration, proof } });
  const evidence = closeEvidence(journal);
  const privateMaterials = [credential, transportCapability, actorKey.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(), operatorKey.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()];
  const exported = JSON.stringify(responses) + files(directory).map(file => readFileSync(file, 'utf8')).join('\n');
  for (const secret of privateMaterials) assert.ok(!exported.includes(secret), 'SECRET_ESCAPED');
  assert.ok(!/"(?:accessToken|refreshToken|password|sessionCookie|privateKeyPem)"\s*:/.test(exported), 'SECRET_FIELD_ESCAPED');
  const report = { status: 'pass', maturity: 'integration-backed local reference', observedAt: now, gitHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    interface: 'existing loopback Rosetta API', axiDisposition: 'WRAP_EXISTING_INTERFACE', target, subjectRef, authorityRef: child.ref, standingDelegation, actorEvidenceRef: actorEvidence.cid,
    configuredAuthoritySource: configuration.sourceRef, compiledEnvelope: { ref: resolution.envelope.envelopeRef, sourceFrontierRef: resolution.frontierRef, file: 'compiled-envelope.json', sha256: createHash('sha256').update(readFileSync(join(directory, 'compiled-envelope.json'))).digest('hex') },
    providerMetadata: metadata, allowed, denied, amplification, revocation, replays, oldGrantReplay, independentRoot, mutations, finalTarget: provider.inspect(), evidence, secretScan: 'pass',
    limitations: ['Single host current-state fencing; no distributed linearizability claim.', 'Pinned operator configuration establishes source authority; signatures and Receipts only authenticate evidence.', 'Controlled Ed25519 workload and reference credential; production identity/credential lifecycles remain with their owners.', 'MCP #1674 remains donor-first on #1688; this exercises the authorized existing API alternative.', 'No per-operation human approval path; setup admission is outside the repeated-action measurement.', 'No merge, issue closure, release, promotion or production deployment.'] };
  json(join(directory, 'proof.json'), report); verifyOperationalProof(directory); return report;
}

/** Checks retained bytes and actual target/current state, never a fixture-supplied source graph. */
export function verifyOperationalProof(directory) {
  const report = JSON.parse(readFileSync(join(directory, 'proof.json'), 'utf8')); const sources = JSON.parse(readFileSync(join(directory, 'authenticated-sources.json'), 'utf8'));
  assert.ok(verifySignedReceipt(sources.actor.signedReceipt).ok && verifySignedReceipt(sources.operator.proof.signedReceipt).ok, 'PROOF_SIGNATURE_INVALID');
  const actors = new SignedActorEvidenceRegistry([sources.actor.anchor], sources.actor.binding); assert.equal(actors.bind(sources.actor.assertion, sources.actor.signedReceipt).cid, report.actorEvidenceRef);
  const state = new LocalAuthorityState(join(directory, 'authority'), actors); const current = state.inspect();
  assert.equal(current.revision, report.revocation.afterRevision); assert.equal(current.frontierRef, report.revocation.frontierRef);
  assert.equal(state.resolve({ authorityRefs: [report.authorityRef], subjectRef: report.subjectRef, now: report.observedAt, minimumRevision: current.revision }).ok, false);
  assert.equal(state.resolve({ authorityRefs: [report.independentRoot.authorityRef], subjectRef: report.subjectRef, now: report.observedAt, minimumRevision: current.revision }).ok, true);
  const provider = new LocalReferenceProvider(join(directory, 'provider'), 'inspection-only', report.target, ['A', 'A2', 'B']); assert.deepEqual(provider.inspect(), report.finalTarget); assert.equal(report.finalTarget.effectCount, 2);
  const journal = new LocalAdmissionJournal(join(directory, 'evidence')); const evidence = closeEvidence(journal); assert.deepEqual(evidence, report.evidence);
  assert.equal(createHash('sha256').update(readFileSync(join(directory, report.compiledEnvelope.file))).digest('hex'), report.compiledEnvelope.sha256);
  for (const row of [...report.allowed, ...report.denied]) { const { measurementRef, ...expected } = row; assert.deepEqual(journal.read(measurementRef).payload.effectProbe, expected); }
  for (const row of report.denied) { assert.deepEqual(row.before, row.after); assert.equal(row.httpStatus, 403); assert.equal(row.code, 'ENTIF_AUTHORITY_DENIED'); }
  return { ok: true, revision: current.revision, finalTarget: report.finalTarget, evidence };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--out'); const directory = index >= 0 ? process.argv[index + 1] : undefined;
  if (!directory) throw new Error('Usage: node tools/authz/operational/proof.mjs --out NEW_EMPTY_DIRECTORY');
  const report = await runOperationalProof(directory);
  console.log(JSON.stringify({ status: report.status, maturity: report.maturity, gitHead: report.gitHead, target: report.finalTarget, revocation: report.revocation, denied: report.denied.length, replays: report.replays.length, evidence: report.evidence, secretScan: report.secretScan, report: resolve(directory, 'proof.json') }, null, 2));
}
