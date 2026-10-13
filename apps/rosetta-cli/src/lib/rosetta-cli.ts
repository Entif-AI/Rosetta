import {
  BOOTSTRAP_GATE_INSPECTION_SCENARIOS,
  buildBootstrapDemoSnapshot,
  buildBootstrapGateInspectionReport,
  createIngressJob,
  isBootstrapGateInspectionScenario,
  type BootstrapGateInspectionReport,
  type BootstrapGateInspectionScenario,
} from '@entif-ai/ingress-refinery';
import {
  projectToMissionControl,
  projectToOb1Sidecar,
  projectToPrismShadow,
} from '@entif-ai/projection-adapters';
import {
  buildLifecycleDemo,
  buildPromotionTransitionDemo,
  verifyReceiptBundle,
  verifySignedReceipt,
} from '@entif-ai/rosetta-receipts';
import { listSchemaCatalogEntries } from '@entif-ai/rosetta-schemas';
import { InMemoryTileStore } from '@entif-ai/rosetta-store';

export interface RosettaCliExecution {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export interface RosettaVerificationCheck {
  errors: string[];
  ok: boolean;
}

export interface RosettaVerificationReport {
  checks: {
    bootstrapGate: RosettaVerificationCheck;
    receiptBundle: RosettaVerificationCheck;
    signedReceipt: RosettaVerificationCheck;
  };
  note: string;
  result: 'fail' | 'pass';
  status: 'fixture-backed';
}

export interface RosettaTamperCheck {
  detected: boolean;
  expectedVerificationResult: 'fail';
  verification: RosettaVerificationCheck;
}

export interface RosettaTamperReport {
  checks: {
    missingClosureMember: RosettaTamperCheck;
    signatureBindingMismatch: RosettaTamperCheck;
  };
  note: string;
  result: 'fail' | 'pass';
  status: 'fixture-backed';
}

type CliOutputFormat = 'json' | 'text';

type ParsedCliCommand =
  | { kind: 'demo' }
  | { kind: 'help' }
  | {
      kind: 'inspect-bootstrap-gate';
      scenario: BootstrapGateInspectionScenario;
    }
  | { format: CliOutputFormat; kind: 'tamper' }
  | { format: CliOutputFormat; kind: 'verify' };

type CliParseResult =
  | { command: ParsedCliCommand; ok: true }
  | { error: string; ok: false };

const MISSING_TAMPER_CID = `sha256:${'0'.repeat(64)}`;

const CLI_USAGE = `Rosetta research workbench

Usage:
  rosetta-cli
  rosetta-cli demo
  rosetta-cli inspect bootstrap-gate [--scenario <${BOOTSTRAP_GATE_INSPECTION_SCENARIOS.join(
    '|'
  )}>]
  rosetta-cli verify [--json]
  rosetta-cli tamper [--json]
  rosetta-cli help

Commands:
  demo      Emit the aggregate fixture-backed Rosetta bootstrap snapshot as JSON.
  inspect   Emit one read-only guarded-bootstrap report as JSON.
  verify    Verify the guarded bootstrap, signed receipt, and receipt-bundle closure.
  tamper    Prove that signature-binding and missing-closure tampering are detected.
  help      Show this help text.

Exit codes:
  0  Requested proof or expected tamper detection passed.
  1  Verification failed or the expected tampering was not detected.
  2  Command-line usage error.`;

function buildDemoContext() {
  const snapshot = buildBootstrapDemoSnapshot();
  const ingressJob = createIngressJob(
    snapshot.record.cid,
    snapshot.manifestation.cid
  );
  const store = new InMemoryTileStore();

  [
    snapshot.sourceSystem,
    snapshot.record,
    snapshot.manifestation,
    snapshot.fetchReceipt,
    snapshot.normalizationReceipt,
    snapshot.evaluationReceipt,
    snapshot.trustMatrix,
    snapshot.canonicalArtifact,
    snapshot.policyTile,
    snapshot.receipt,
    snapshot.tapestry,
  ].forEach((tile) => store.put(tile));

  return { ingressJob, snapshot, store };
}

function copyVerification(result: {
  errors: string[];
  ok: boolean;
}): RosettaVerificationCheck {
  return {
    errors: [...result.errors],
    ok: result.ok,
  };
}

function buildBootstrapGateCheck(
  report: BootstrapGateInspectionReport
): RosettaVerificationCheck {
  const { bootstrapGate } = report;
  const errors = new Set(bootstrapGate.errors);

  if (bootstrapGate.status !== 'pass') {
    errors.add(`Bootstrap gate returned ${bootstrapGate.status}.`);
  }
  if (bootstrapGate.guard.effect !== 'allow') {
    errors.add(`Bootstrap Guard returned ${bootstrapGate.guard.effect}.`);
  }
  if (!bootstrapGate.closureArtifact.exists) {
    errors.add('Bootstrap closure artifact is missing.');
  }
  for (const error of bootstrapGate.receiptBundleVerification.errors) {
    errors.add(error);
  }
  if (bootstrapGate.steps.some((step) => step.status !== 'pass')) {
    errors.add('One or more bootstrap gate steps did not pass.');
  }

  return {
    errors: [...errors],
    ok:
      bootstrapGate.status === 'pass' &&
      bootstrapGate.guard.effect === 'allow' &&
      bootstrapGate.closureArtifact.exists &&
      bootstrapGate.receiptBundleVerification.ok &&
      bootstrapGate.steps.every((step) => step.status === 'pass'),
  };
}

export function buildRosettaCliOutput() {
  const { ingressJob, snapshot, store } = buildDemoContext();

  return {
    lifecycleDemo: buildLifecycleDemo(),
    promotionTransitionDemo: buildPromotionTransitionDemo(),
    action: snapshot.action,
    canonicalArtifact: snapshot.canonicalArtifact,
    conformanceBundle: snapshot.conformanceBundle,
    bootstrapGate: buildBootstrapGateInspectionReport().bootstrapGate,
    ingressJob,
    missionControl: projectToMissionControl(
      snapshot.canonicalArtifact,
      ingressJob,
      snapshot.receiptBundle
    ),
    ob1: projectToOb1Sidecar(
      snapshot.canonicalArtifact,
      snapshot.receiptBundle
    ),
    prism: projectToPrismShadow(
      snapshot.canonicalArtifact,
      snapshot.trustMatrix,
      snapshot.receiptBundle
    ),
    receiptBundleVerification: verifyReceiptBundle(
      snapshot.receiptBundle,
      store
    ),
    schemaCatalog: {
      entries: listSchemaCatalogEntries(),
      note: 'Inspection output only; exposureStatus values describe catalog visibility and do not imply runtime support.',
    },
    signedReceiptVerification: verifySignedReceipt(snapshot.signedReceipt),
    sourceSystem: snapshot.sourceSystem,
  };
}

export function buildRosettaVerificationReport(): RosettaVerificationReport {
  const { snapshot, store } = buildDemoContext();
  const checks = {
    bootstrapGate: buildBootstrapGateCheck(
      buildBootstrapGateInspectionReport()
    ),
    receiptBundle: copyVerification(
      verifyReceiptBundle(snapshot.receiptBundle, store)
    ),
    signedReceipt: copyVerification(
      verifySignedReceipt(snapshot.signedReceipt)
    ),
  };

  return {
    checks,
    note: 'Fixture-backed proof over the current bounded Rosetta bootstrap path. A passing result does not imply production ingestion, durable persistence, or unrestricted execution support.',
    result: Object.values(checks).every((check) => check.ok) ? 'pass' : 'fail',
    status: 'fixture-backed',
  };
}

export function buildRosettaTamperReport(): RosettaTamperReport {
  const { snapshot, store } = buildDemoContext();
  const tamperedSignedReceipt = {
    ...snapshot.signedReceipt,
    signature: {
      ...snapshot.signedReceipt.signature,
      signedCid: `${snapshot.signedReceipt.signature.signedCid}.tampered`,
    },
  };
  const tamperedReceiptBundle = {
    ...snapshot.receiptBundle,
    closureCids: [...snapshot.receiptBundle.closureCids, MISSING_TAMPER_CID],
  };
  const signatureVerification = copyVerification(
    verifySignedReceipt(tamperedSignedReceipt)
  );
  const closureVerification = copyVerification(
    verifyReceiptBundle(tamperedReceiptBundle, store)
  );
  const checks = {
    missingClosureMember: {
      detected:
        !closureVerification.ok &&
        closureVerification.errors.includes(
          `Missing closure member: ${MISSING_TAMPER_CID}`
        ),
      expectedVerificationResult: 'fail' as const,
      verification: closureVerification,
    },
    signatureBindingMismatch: {
      detected:
        !signatureVerification.ok &&
        signatureVerification.errors.includes(
          'Signature CID binding mismatch.'
        ),
      expectedVerificationResult: 'fail' as const,
      verification: signatureVerification,
    },
  };

  return {
    checks,
    note: 'Negative proof only. The command clones fixture artifacts in memory, introduces bounded defects, and passes only when both defects are detected.',
    result: Object.values(checks).every((check) => check.detected)
      ? 'pass'
      : 'fail',
    status: 'fixture-backed',
  };
}

function parseOutputFormat(
  arguments_: readonly string[],
  commandName: string
): { format: CliOutputFormat; ok: true } | { error: string; ok: false } {
  if (arguments_.length === 0) {
    return { format: 'text', ok: true };
  }
  if (arguments_.length === 1 && arguments_[0] === '--json') {
    return { format: 'json', ok: true };
  }

  return {
    error: `${commandName} accepts only the optional --json flag.`,
    ok: false,
  };
}

function parseInspectCommand(arguments_: readonly string[]): CliParseResult {
  if (arguments_[0] !== 'bootstrap-gate') {
    return {
      error: 'inspect requires the bootstrap-gate target.',
      ok: false,
    };
  }

  let scenario: BootstrapGateInspectionScenario = 'pass';
  let scenarioWasSet = false;

  for (let index = 1; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    let candidate: string | undefined;

    if (argument === '--scenario') {
      candidate = arguments_[index + 1];
      index += 1;
    } else if (argument.startsWith('--scenario=')) {
      candidate = argument.slice('--scenario='.length);
    } else if (argument === '--json') {
      continue;
    } else {
      return {
        error: `inspect does not recognize argument: ${argument}`,
        ok: false,
      };
    }

    if (scenarioWasSet) {
      return {
        error: 'inspect accepts only one --scenario value.',
        ok: false,
      };
    }
    if (!isBootstrapGateInspectionScenario(candidate)) {
      return {
        error: `unsupported bootstrap gate scenario: ${
          candidate ?? '(missing)'
        }`,
        ok: false,
      };
    }

    scenario = candidate;
    scenarioWasSet = true;
  }

  return {
    command: { kind: 'inspect-bootstrap-gate', scenario },
    ok: true,
  };
}

function parseCliArguments(arguments_: readonly string[]): CliParseResult {
  if (arguments_.length === 0) {
    return { command: { kind: 'demo' }, ok: true };
  }

  const [commandName, ...commandArguments] = arguments_;

  if (
    commandName === 'help' ||
    commandName === '--help' ||
    commandName === '-h'
  ) {
    if (commandArguments.length > 0) {
      return { error: 'help does not accept additional arguments.', ok: false };
    }
    return { command: { kind: 'help' }, ok: true };
  }

  if (commandName === 'demo') {
    if (
      commandArguments.length > 1 ||
      (commandArguments.length === 1 && commandArguments[0] !== '--json')
    ) {
      return {
        error: 'demo accepts only the optional --json flag.',
        ok: false,
      };
    }
    return { command: { kind: 'demo' }, ok: true };
  }

  if (commandName === 'inspect') {
    return parseInspectCommand(commandArguments);
  }

  if (commandName === 'verify' || commandName === 'tamper') {
    const formatResult = parseOutputFormat(commandArguments, commandName);
    if (!formatResult.ok) {
      return formatResult;
    }

    return {
      command: { format: formatResult.format, kind: commandName },
      ok: true,
    };
  }

  return {
    error: `unknown command: ${commandName}`,
    ok: false,
  };
}

function serializeJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function renderVerificationCheck(
  label: string,
  check: RosettaVerificationCheck
): string {
  const heading = `- ${label}: ${check.ok ? 'PASS' : 'FAIL'}`;
  return check.errors.length === 0
    ? heading
    : `${heading}\n  ${check.errors.join('\n  ')}`;
}

function renderVerificationReport(report: RosettaVerificationReport): string {
  return [
    `Rosetta bootstrap verification: ${report.result.toUpperCase()}`,
    renderVerificationCheck('guarded bootstrap', report.checks.bootstrapGate),
    renderVerificationCheck('signed receipt', report.checks.signedReceipt),
    renderVerificationCheck(
      'receipt-bundle closure',
      report.checks.receiptBundle
    ),
    report.note,
  ].join('\n');
}

function renderTamperCheck(label: string, check: RosettaTamperCheck): string {
  const heading = `- ${label}: ${check.detected ? 'DETECTED' : 'MISSED'}`;
  return check.verification.errors.length === 0
    ? heading
    : `${heading}\n  ${check.verification.errors.join('\n  ')}`;
}

function renderTamperReport(report: RosettaTamperReport): string {
  return [
    `Rosetta tamper-negative proof: ${report.result.toUpperCase()}`,
    renderTamperCheck(
      'signature CID binding mismatch',
      report.checks.signatureBindingMismatch
    ),
    renderTamperCheck(
      'missing receipt-bundle closure member',
      report.checks.missingClosureMember
    ),
    report.note,
  ].join('\n');
}

function formatThrownError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error.';
}

export function runRosettaCli(
  arguments_: readonly string[]
): RosettaCliExecution {
  const parseResult = parseCliArguments(arguments_);
  if (!parseResult.ok) {
    return {
      exitCode: 2,
      stderr: `${parseResult.error}\n\n${CLI_USAGE}`,
      stdout: '',
    };
  }

  try {
    const { command } = parseResult;

    switch (command.kind) {
      case 'demo':
        return {
          exitCode: 0,
          stderr: '',
          stdout: serializeJson(buildRosettaCliOutput()),
        };
      case 'help':
        return { exitCode: 0, stderr: '', stdout: CLI_USAGE };
      case 'inspect-bootstrap-gate':
        return {
          exitCode: 0,
          stderr: '',
          stdout: serializeJson(
            buildBootstrapGateInspectionReport(command.scenario)
          ),
        };
      case 'verify': {
        const report = buildRosettaVerificationReport();
        return {
          exitCode: report.result === 'pass' ? 0 : 1,
          stderr: '',
          stdout:
            command.format === 'json'
              ? serializeJson(report)
              : renderVerificationReport(report),
        };
      }
      case 'tamper': {
        const report = buildRosettaTamperReport();
        return {
          exitCode: report.result === 'pass' ? 0 : 1,
          stderr: '',
          stdout:
            command.format === 'json'
              ? serializeJson(report)
              : renderTamperReport(report),
        };
      }
    }

    const exhaustiveCommand: never = command;
    return exhaustiveCommand;
  } catch (error) {
    return {
      exitCode: 1,
      stderr: `Rosetta CLI failed: ${formatThrownError(error)}`,
      stdout: '',
    };
  }
}
