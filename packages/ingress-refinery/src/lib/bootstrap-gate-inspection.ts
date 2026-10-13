import {
  buildBootstrapGateSnapshot,
  type BootstrapGateOptions,
  type BootstrapGateSnapshot,
} from './ingress-refinery.js';

export const BOOTSTRAP_GATE_INSPECTION_SCENARIOS = [
  'pass',
  'block',
  'deny',
  'fail',
] as const;

export type BootstrapGateInspectionScenario =
  (typeof BOOTSTRAP_GATE_INSPECTION_SCENARIOS)[number];

export interface BootstrapGateInspectionReport {
  bootstrapGate: BootstrapGateSnapshot;
  note: string;
  scenario: BootstrapGateInspectionScenario;
  status: 'fixture-backed';
}

export function isBootstrapGateInspectionScenario(
  value: string | null | undefined
): value is BootstrapGateInspectionScenario {
  return (
    typeof value === 'string' &&
    BOOTSTRAP_GATE_INSPECTION_SCENARIOS.some((scenario) => scenario === value)
  );
}

function buildBootstrapGateOptions(
  scenario: BootstrapGateInspectionScenario
): BootstrapGateOptions {
  switch (scenario) {
    case 'pass':
      return {};
    case 'block':
      return {
        guardRules: [
          {
            actionPattern: 'builtin.echo',
            effect: 'allow',
            id: 'bootstrap.inspect.unbacked-allow',
            mode: 'parse-only',
            resourcePattern: 'builtin://echo',
          },
        ],
      };
    case 'deny':
      return {
        guardRules: [
          {
            actionPattern: 'builtin.echo',
            effect: 'deny',
            id: 'bootstrap.inspect.explicit-deny',
            mode: 'parse-only',
            resourcePattern: 'builtin://echo',
          },
        ],
      };
    case 'fail':
      return { maxEchoBytes: 0 };
  }

  const exhaustiveScenario: never = scenario;
  return exhaustiveScenario;
}

export function buildBootstrapGateInspectionReport(
  scenario: BootstrapGateInspectionScenario = 'pass'
): BootstrapGateInspectionReport {
  return {
    bootstrapGate: buildBootstrapGateSnapshot(
      buildBootstrapGateOptions(scenario)
    ),
    note: 'Read-only fixture-backed inspection. This report does not grant execution, mutation, redrive, recorder, cache, or catalog authority.',
    scenario,
    status: 'fixture-backed',
  };
}
