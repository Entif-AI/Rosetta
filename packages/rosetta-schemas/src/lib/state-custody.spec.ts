import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  createStateCustody,
  parseStateCustody,
  createStateRecovery,
  parseStateRecovery,
  admitRecoveredMaterializedViewReuse,
  STATE_CUSTODY_SCHEMA,
  STATE_RECOVERY_SCHEMA,
  RECOVERY_DISPOSITIONS,
  type StateCustody,
  type StateRecovery,
} from './state-custody.js';
import { traceHash } from './trace-normalization.js';
import { createMaterializedView } from './materialized-view.js';

const artifact = {
  ref: 'urn:example:artifact:1',
  sha256: traceHash('exact original state'),
};
const classifications: StateCustody['classification'][] = [
  {
    kind: 'NATIVE',
    sourceAuthorityRef: 'urn:example:source-authority',
    restoreProcedureRef: 'urn:example:restore:1',
  },
  {
    kind: 'DERIVED',
    materializedViewRef: 'urn:example:view:1',
    recipe: { ref: 'urn:example:recipe', version: '1' },
  },
  {
    kind: 'OPERATOR',
    purposeRef: 'urn:example:operator-purpose',
    nonRebuildableReasonRef: 'urn:example:operator-judgment',
    restoreProcedureRef: 'urn:example:restore:2',
  },
  { kind: 'EPHEMERAL' },
];
function declaration(
  classification: StateCustody['classification'],
  overrides: Partial<Omit<StateCustody, 'recordId'>> = {}
) {
  return createStateCustody({
    profile: { id: 'state.custody.v1', version: '1.0.0' },
    familyRef: 'urn:example:family',
    revisionRef: 'urn:example:revision:1',
    ownerRef: 'urn:example:owner',
    authorityClaimRef: 'urn:example:claim',
    custodyRef: 'urn:example:primary-custody',
    custodianRef: 'urn:example:custodian',
    writerAssignmentRefs:
      classification.kind === 'EPHEMERAL'
        ? []
        : ['urn:example:writer-assignment'],
    classification,
    artifact: classification.kind === 'EPHEMERAL' ? null : artifact,
    dependencyRefs: ['urn:example:dependency:1', 'urn:example:dependency:2'],
    closure: 'COMPLETE',
    scope: {
      policyRef: 'urn:example:policy:1',
      rightsRef: 'urn:example:rights:1',
      tenantRef: null,
      frontierRef: 'urn:example:frontier:1',
    },
    retentionPolicyRef: 'urn:example:retention-policy',
    invalidationRefs: [],
    revalidationRefs: [],
    predecessorRef: null,
    provenanceRefs: ['urn:example:provenance'],
    receiptRefs: ['urn:example:declaration-receipt'],
    ...overrides,
  });
}
const readback = {
  artifact,
  observationRef: 'urn:example:readback',
  receiptRefs: ['urn:example:readback-receipt'],
};
const rebuilt: StateRecovery['result'] = {
  kind: 'REBUILT',
  readback,
  rebuildReceiptRefs: ['urn:example:rebuild-receipt'],
};
const restored: StateRecovery['result'] = {
  kind: 'RESTORED',
  readback,
  payload: {
    artifact: {
      ref: 'urn:example:signed-event',
      sha256: traceHash('independent signed event with reconstructive payload'),
    },
    custodyRef: 'urn:example:independent-custody',
    custodianRef: 'urn:example:backup-custodian',
    reconstructionEvaluationRef: 'urn:example:reconstruction-evaluation',
    verificationReceiptRefs: ['urn:example:signature-verification'],
  },
};
function recoveryBody(
  state: StateCustody,
  result: StateRecovery['result'],
  overrides: Partial<Omit<StateRecovery, 'recordId'>> = {}
) {
  return {
    profile: { id: 'state.recovery.v1', version: '1.0.0' },
    custodyRecordRef: state.recordId,
    actionRef: 'urn:example:recovery-action',
    authority: {
      ownerRef: state.ownerRef,
      actorRef: 'urn:example:operator',
      writerAssignmentRef: 'urn:example:writer-assignment',
      policyRef: 'urn:example:policy:2',
      tenantRef: state.scope.tenantRef,
      rightsDecisionRef: 'urn:example:current-rights',
      retentionDecisionRef: 'urn:example:current-retention',
      frontierRef: 'urn:example:frontier:2',
    },
    stateDisposition: {
      disposition: 'AVAILABLE',
      evidenceRefs: ['urn:example:state-availability'],
    },
    dependencies: state.dependencyRefs.map((dependencyRef) => ({
      dependencyRef,
      disposition: 'AVAILABLE',
      evidenceRefs: ['urn:example:dependency-observation'],
    })),
    result,
    predecessorRef: null,
    provenanceRefs: ['urn:example:recovery-provenance'],
    receiptRefs: ['urn:example:recovery-receipt'],
    ...overrides,
  };
}
const recovery = (
  state: StateCustody,
  result: StateRecovery['result'],
  overrides: Partial<Omit<StateRecovery, 'recordId'>> = {}
) => createStateRecovery(recoveryBody(state, result, overrides), state);

describe('proposed state custody Profile #1879', () => {
  it('round-trips all four declared authority classes without treating them as authorization', () => {
    for (const kind of classifications) {
      const record = declaration(kind);
      expect(
        parseStateCustody(JSON.parse(JSON.stringify(record))).classification
      ).toEqual(kind);
      expect(record.artifact).toEqual(
        kind.kind === 'EPHEMERAL' ? null : artifact
      );
    }
  });
  it('cannot add a native source authority to a derived classification', () => {
    const derived = {
      ...classifications[1],
      sourceAuthorityRef: 'urn:example:competing-source',
    };
    expect(() =>
      createStateCustody({
        ...Object.fromEntries(
          Object.entries(declaration(classifications[1]!)).filter(
            ([key]) => key !== 'recordId'
          )
        ),
        classification: derived,
      })
    ).toThrow(/Invalid evidence contract/);
    expect(() =>
      declaration(classifications[1]!, { dependencyRefs: [] })
    ).toThrow(/source\/dependency/);
  });
  it('retains explicit incomplete closure and rejects ephemeral durable or unassigned durable state', () => {
    expect(
      declaration(classifications[1]!, { closure: 'UNKNOWN' }).closure
    ).toBe('UNKNOWN');
    expect(() => declaration(classifications[3]!, { artifact })).toThrow(
      /Ephemeral/
    );
    expect(() =>
      declaration(classifications[2]!, { writerAssignmentRefs: [] })
    ).toThrow(/writer assignment/);
  });
  it('preserves distinct immutable revision identity and predecessor references', () => {
    const first = declaration(classifications[2]!);
    const second = declaration(classifications[2]!, {
      revisionRef: 'urn:example:revision:2',
      predecessorRef: first.recordId,
    });
    expect(second.recordId).not.toBe(first.recordId);
    expect(second.predecessorRef).toBe(first.recordId);
    expect(() =>
      parseStateCustody({ ...first, revisionRef: second.revisionRef })
    ).toThrow(/digest/);
  });
});
describe('proposed state recovery evidence #1879', () => {
  it('rebuilds only derived state against exact complete closure and readback', () => {
    const state = declaration(classifications[1]!);
    const record = recovery(state, rebuilt);
    expect(parseStateRecovery(record, state).result).toEqual(rebuilt);
    for (const index of [0, 2, 3])
      expect(() =>
        recovery(declaration(classifications[index]!), rebuilt)
      ).toThrow();
    expect(() =>
      recovery(state, {
        ...rebuilt,
        readback: {
          ...readback,
          artifact: { ...artifact, sha256: traceHash('different') },
        },
      })
    ).toThrow(/readback/);
    expect(() => recovery(state, rebuilt, { dependencies: [] })).toThrow(
      /closure/
    );
    expect(() =>
      recovery(
        declaration(classifications[1]!, { closure: 'PARTIAL' }),
        rebuilt
      )
    ).toThrow(/closure/);
  });
  it('restores operator and native state from independently held reconstructive payloads, not receipts alone', () => {
    for (const index of [0, 2]) {
      const state = declaration(classifications[index]!);
      expect(recovery(state, restored).result).toEqual(restored);
      const receiptOnly = {
        ...restored,
        payload: { verificationReceiptRefs: ['urn:example:digest-only'] },
      };
      expect(() =>
        createStateRecovery(
          { ...recoveryBody(state, restored), result: receiptOnly },
          state
        )
      ).toThrow(/Invalid evidence contract/);
      expect(() =>
        recovery(state, {
          ...restored,
          payload: { ...restored.payload, custodyRef: state.custodyRef },
        })
      ).toThrow(/independently/);
      expect(() =>
        recovery(state, {
          ...restored,
          payload: {
            ...restored.payload,
            artifact: {
              ...restored.payload.artifact,
              ref: restored.payload.verificationReceiptRefs[0]!,
            },
          },
        })
      ).toThrow(/independently/);
    }
    expect(() => recovery(declaration(classifications[1]!), restored)).toThrow(
      /non-rebuildable/
    );
  });
  it('preserves each unavailable, revoked or unknown cause and refuses a successful reconstruction', () => {
    const state = declaration(classifications[1]!);
    for (const disposition of RECOVERY_DISPOSITIONS.filter(
      (x) => x !== 'AVAILABLE'
    )) {
      const stateDisposition = {
        disposition,
        evidenceRefs: ['urn:example:availability'],
      };
      const kind = [
        'ACCESS_LOST',
        'RETENTION_EXPIRED',
        'RIGHTS_REVOKED',
      ].includes(disposition)
        ? 'RIGHTS_RESTRICTED'
        : disposition === 'RECOVERY_CLOSURE_UNKNOWN'
        ? 'UNKNOWN'
        : 'SOURCE_UNAVAILABLE';
      expect(
        recovery(
          state,
          { kind, evidenceRefs: ['urn:example:unavailable'] },
          { stateDisposition }
        ).stateDisposition.disposition
      ).toBe(disposition);
      expect(() => recovery(state, rebuilt, { stateDisposition })).toThrow(
        /closure/
      );
      expect(() =>
        recovery(state, rebuilt, {
          dependencies: [
            { ...stateDisposition, dependencyRef: state.dependencyRefs[0]! },
          ],
        })
      ).toThrow(/closure/);
    }
    const revoked = {
      disposition: 'RIGHTS_REVOKED' as const,
      evidenceRefs: ['urn:example:revoked'],
    };
    expect(() =>
      recovery(
        state,
        { kind: 'UNKNOWN', evidenceRefs: ['urn:example:failure'] },
        { stateDisposition: revoked }
      )
    ).toThrow(/restricted/);
  });
  it('rejects hidden substitution of owner, dependency or declaration coordinates', () => {
    const state = declaration(classifications[1]!);
    const record = recovery(state, rebuilt);
    expect(() =>
      recovery(state, rebuilt, {
        authority: {
          ...record.authority,
          writerAssignmentRef: 'urn:example:foreign',
        },
      })
    ).toThrow(/assignment/);
    expect(() =>
      recovery(state, rebuilt, {
        authority: {
          ...record.authority,
          tenantRef: 'urn:example:foreign-tenant',
        },
      })
    ).toThrow(/assignment/);
    expect(() =>
      recovery(state, rebuilt, {
        dependencies: [record.dependencies[0]!, record.dependencies[0]!],
      })
    ).toThrow(/unique/);
    expect(() =>
      recovery(state, rebuilt, {
        dependencies: [
          { ...record.dependencies[0]!, dependencyRef: 'urn:example:foreign' },
        ],
      })
    ).toThrow(/declared/);
    expect(() =>
      parseStateRecovery(
        record,
        declaration(classifications[1]!, { revisionRef: 'urn:example:other' })
      )
    ).toThrow(/different custody/);
    expect(() =>
      parseStateRecovery(
        { ...record, actionRef: 'urn:example:other-action' },
        state
      )
    ).toThrow(/digest/);
  });
  it('records rebuild as a recovery observation, not a currency or rights decision', () => {
    const state = declaration(classifications[1]!, {
      invalidationRefs: ['urn:example:revocation'],
      revalidationRefs: [],
    });
    const result = recovery(state, rebuilt);
    expect(state.invalidationRefs).toEqual(['urn:example:revocation']);
    expect(state.revalidationRefs).toEqual([]);
    expect(result.result.kind).toBe('REBUILT');
    expect(Object.keys(result.result).sort()).toEqual([
      'kind',
      'readback',
      'rebuildReceiptRefs',
    ]);
    expect(() =>
      createStateRecovery(
        { ...recoveryBody(state, rebuilt), current: true },
        state
      )
    ).toThrow(/Invalid evidence contract/);
  });
  it('composes exact recovered material with the existing view admission contract; revocation still denies reuse', () => {
    const environment = {
      coreVersion: '3.0.0',
      dependencyLockRefs: ['lock:1'],
      translatorRevisionRefs: [],
      migrationRevisionRefs: [],
      policyRef: 'policy:1',
      rightsRef: 'rights:1',
      tenantRef: null,
      workspaceRef: null,
      transformation: {
        kind: 'index',
        identity: { ref: 'recipe', version: '1', cid: null },
        configurationRef: null,
      },
      datasetRevisionRefs: [],
      canonicalizationRef: 'jcs',
      conformanceProfileRefs: ['conformance:1'],
    };
    const view = createMaterializedView({
      profile: { id: 'materialized.view.v1', version: '1.0.0' },
      familyRef: 'family',
      source: {
        identity: { ref: 'source', version: '1', cid: null },
        frontier: {
          status: 'known',
          frontierRef: 'frontier:1',
          cursorRef: 'cursor:1',
          snapshotRef: null,
        },
      },
      environment,
      temporal: {
        eventWindowRef: 'events',
        observationWindowRef: 'observations',
        knowledgeFrontierRef: 'frontier:1',
      },
      artifact: { ...artifact, cid: null },
      materializedAt: '2026-11-25T00:00:00Z',
      state: 'CURRENT_FOR_DECLARED_FRONTIER',
      driftEvidenceRefs: [],
      affectedScopeRefs: [],
      impact: null,
      replacementRefs: [],
      supersedesRefs: [],
      evidenceRefs: ['evidence'],
      receiptRefs: [],
      provenanceRefs: ['source'],
    });
    const classification: StateCustody['classification'] = {
      kind: 'DERIVED',
      materializedViewRef: view.recordId,
      recipe: { ref: 'recipe', version: '1' },
    };
    const scope = {
      policyRef: 'policy:1',
      rightsRef: 'rights:1',
      tenantRef: null,
      frontierRef: 'frontier:1',
    };
    const state = declaration(classification, { scope });
    const recovered = recovery(state, rebuilt);
    expect(recovered.result).toEqual(rebuilt);
    const context = {
      rightsAllowed: true,
      rightsDecisionRef: 'decision:1',
      requireCurrent: true,
      frontierRef: 'frontier:1',
      environment: view.environment,
    };
    const request = { declaration: state, recovery: recovered, view, context };
    expect(admitRecoveredMaterializedViewReuse(request).recordId).toBe(
      view.recordId
    );
    expect(() =>
      admitRecoveredMaterializedViewReuse({
        ...request,
        context: { ...context, frontierRef: 'cursor:1' },
      })
    ).toThrow(/exact custody frontier/);
    expect(() =>
      admitRecoveredMaterializedViewReuse({
        ...request,
        context: { ...context, rightsAllowed: false },
      })
    ).toThrow(/rights/);
    expect(() =>
      admitRecoveredMaterializedViewReuse({
        ...request,
        context: {
          ...context,
          environment: { ...view.environment, rightsRef: 'rights:2' },
        },
      })
    ).toThrow(/policy|rights/);
    const otherView = createMaterializedView({
      ...Object.fromEntries(
        Object.entries(view).filter(([key]) => key !== 'recordId')
      ),
      familyRef: 'other-family',
    });
    expect(() =>
      admitRecoveredMaterializedViewReuse({ ...request, view: otherView })
    ).toThrow(/exact materialized view/);
    const invalidated = declaration(classification, {
      scope,
      invalidationRefs: ['invalidation:1'],
      revalidationRefs: ['unresolved-reference:1'],
    });
    expect(() =>
      admitRecoveredMaterializedViewReuse({
        ...request,
        declaration: invalidated,
        recovery: recovery(invalidated, rebuilt),
      })
    ).toThrow(/independent revalidation/);
    expect(() =>
      admitRecoveredMaterializedViewReuse({
        ...request,
        context: { ...context, requireCurrent: false },
      })
    ).toThrow(/explicit current admission/);
  });
});
it('keeps documented JSON schemas identical to the executable proposed schemas', () => {
  for (const [name, schema] of [
    ['state-custody-v1', STATE_CUSTODY_SCHEMA],
    ['state-recovery-v1', STATE_RECOVERY_SCHEMA],
  ] as const) {
    expect(
      JSON.parse(
        readFileSync(
          new URL('../../docs/' + name + '.schema.json', import.meta.url),
          'utf8'
        )
      )
    ).toEqual(schema);
  }
});
