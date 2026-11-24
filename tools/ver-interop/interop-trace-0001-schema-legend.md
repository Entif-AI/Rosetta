# VER-ROSETTA-INTEROP-TRACE-0001: Schema Legend and Adapter Notes

Status: Draft external interoperability handoff
Version: 0.1.0
Date: 2026-10-05
Rosetta source baseline: `Entif-AI/Rosetta` commit `555503eead2f532bb133e3eaffd8f4dbacdf2a7a`
Fixture: `interop-trace-0001.json`
Transport schema: `interop-trace-0001.schema.json`

## 1. What this fixture is

This is a deliberately small provider-free Rosetta-native execution trace constructed against the current public Rosetta Core constructors, Receipt contract, and Tapestry closure contract.

Its purpose is to support a first independent adapter experiment:

```text
Rosetta trace
  -> independently authored VER adapter
  -> independent VER Core
  -> auditable VER-side output
```

The fixture contains no `ver.*` artifacts and no Rosetta-authored expected VER diagnosis.

That absence is intentional. The first experiment tests whether VER can consume Rosetta's observable trace substrate before Rosetta starts encoding VER conclusions.

## 2. What this fixture is not

This fixture is not:

- a VER benchmark;
- a VER Core implementation;
- a scientific validation of VER;
- a scientific validation of Rosetta;
- evidence of partnership or endorsement;
- a representation-insufficiency case by declaration;
- a hidden-chain-of-thought trace;
- a record of an opaque model's latent causal state;
- production telemetry;
- a live-provider trace.

A conservative VER result such as "local corrective explanation supported," "no major insufficiency supported within this trace," or "insufficient evidence for a representational conclusion" is a legitimate interoperability outcome.

## 3. Maturity statement

The fixture declares:

```text
constructed-against-current-executable-contracts
```

This means:

- its Tile shapes follow the current public constructors inspected at the stated commit;
- its canonical bodies and CIDs were independently recomputed using the same public canonicalization/hash rules;
- its Receipt signature was generated and verified locally with Ed25519;
- it was not emitted by running a full clone of the Rosetta repository in this environment because the execution sandbox could not reach GitHub to clone the repository.

It MUST NOT be described as repository-run output until replayed through the canonical repository implementation.

## 4. Top-level transport object

The outer JSON object is an experiment transport wrapper. It is not a Rosetta Core Tile.

| Field | Meaning | Protocol status |
| --- | --- | --- |
| `format` | Identifies this external test-fixture transport | Non-normative experiment field |
| `formatVersion` | Version of this transport wrapper | Non-normative experiment field |
| `fixtureId` | Stable human/test handle for this fixture | Non-normative experiment field |
| `sourceCommit` | Rosetta implementation commit against which the shapes were constructed | Provenance metadata, not scientific evidence |
| `maturity` | Truthful maturity label | Documentation metadata |
| `purpose` | Bounded experiment intent and non-claims | Documentation metadata |
| `integrity` | Describes canonicalization/CID/signature expectations | Experiment verification metadata |
| `roleIndex` | Convenience map from human-readable fixture roles to exact Tile CIDs | Derived navigation aid, not Rosetta semantic authority |
| `tiles` | The actual Rosetta Tile envelopes | Core/extension artifacts according to their `kind`/`pack` |
| `receiptBundle` | Current implementation closure helper around the Receipt | Implementation closure object, not a Core Tile |
| `signedReceipt` | Receipt plus detached Ed25519 signature metadata | Current Receipt signing envelope |
| `expectedTraversal` | Recommended inspection order for this fixture | Test/navigation aid; MUST NOT be treated as causal proof |

The JSON Schema supplied with this package validates this transport shape. It is intentionally labeled non-normative and MUST NOT be confused with the future VER Pack schema.

## 5. Current TileEnvelope contract used here

Each member of `tiles` follows the current TypeScript `TileEnvelope<P>` implementation:

```ts
interface TileEnvelope<P = unknown> {
  cid: string;
  kind: string;
  pack: string;
  version: string;
  parents: string[];
  createdAt: string;
  canonical: string;
  payload: P;
}
```

### 5.1 Hashed body

The current implementation derives the CID from the canonical JSON bytes of exactly:

```json
{
  "kind": "...",
  "pack": "...",
  "parents": ["..."],
  "payload": {},
  "version": "..."
}
```

The parent list is sorted before hashing.

### 5.2 Fields excluded from the hash input

The current implementation does not include these envelope fields in the hashed body:

- `cid`;
- `createdAt`;
- `canonical`.

`canonical` is itself the canonical serialization of the hashed body.

### 5.3 CID format

The current implementation emits:

```text
cidv1-sha256-<64 lowercase hexadecimal SHA-256 characters>
```

For this fixture, every Tile CID was recomputed from the stored `canonical` body and checked for equality.

### 5.4 Canonicalization

The public Rosetta implementation uses a deterministic canonical JSON serializer identified in its test/vector API as `RFC8785_JCS`.

For the ASCII/string/integer values used by this fixture, object keys are recursively sorted and serialized deterministically before hashing.

## 6. Important timing caveat

Every Tile in this fixture carries the current constructor default:

```text
2026-04-13T00:00:00.000Z
```

This timestamp is not part of the hashed body and, in this synthetic fixture, is not intended to encode scientific event chronology.

Therefore:

- VER MUST NOT infer temporal duration from `createdAt` in this fixture;
- VER MUST NOT infer physical causality from equal timestamps;
- event ordering for adapter inspection is supplied by the explicit parent graph and `expectedTraversal` convenience list;
- if a VER scientific test requires actual elapsed-time or recurrence windows, this fixture is insufficient and the correct result should say so.

A later scientific fixture should include separately sourced observation/event times under an accepted source/trace contract.

## 7. Core kinds present

The fixture contains these Rosetta Core kinds:

```text
rosetta.run
rosetta.action
rosetta.toolcall
rosetta.observation
rosetta.evaluation
rosetta.receipt
rosetta.tapestry
```

There are no `ver.*` kinds.

## 8. `rosetta.run`

Current payload shape used by the constructor:

```json
{
  "runId": "run.<derived-suffix>",
  "summary": "...",
  "tags": ["..."]
}
```

Fixture role:

```text
Record a deterministic sensor calibration episode for external interoperability testing.
```

Interpretation guidance:

- The Run is the root execution episode.
- It is not a VER representation subject by itself.
- It may be one Trace container that a VER adapter consumes.

Fixture CID:

```text
cidv1-sha256-1da376229d31deeb922698167c72f00f342a9a2cea197ff09b2dc62fc6256cb2
```

## 9. `rosetta.action`

Current payload shape:

```json
{
  "actionId": "action.<derived-suffix>",
  "intent": "...",
  "runCid": "cid..."
}
```

The Action's parent list contains the Run CID in this fixture.

Three Actions are present:

1. measure before calibration;
2. apply deterministic calibration;
3. measure after calibration.

VER guidance:

- An Action records a process/decision step.
- Action intent is not evidence that the intended real-world effect occurred.
- To determine effect, inspect ToolCall/Observation/Evaluation descendants.

## 10. `rosetta.toolcall`

Current payload shape:

```json
{
  "args": {},
  "tool": "...",
  "toolCallId": "tool.<derived-suffix>"
}
```

Current implementation pack:

```text
rosetta.tools
```

The fixture uses two synthetic tools:

```text
fixture.sensor.read
fixture.sensor.calibrate
```

These names represent deterministic fixture operations only. They are not claims that a physical sensor or production service was invoked.

VER guidance:

- A ToolCall records the invocation surface.
- ToolCall arguments may be Trace inputs.
- ToolCall existence does not establish that a scientific intervention succeeded.
- Result/effect must be established through subsequent observable evidence.

## 11. `rosetta.observation`

Current payload shape:

```json
{
  "observationId": "observation.<derived-suffix>",
  "signal": "...",
  "source": "..."
}
```

Three Observations are present:

- pre-calibration sensor reading;
- calibration application record;
- post-calibration sensor reading.

### 11.1 Scientific boundary

For this interoperability work, an Observation means that a bounded signal was recorded in the trace.

It MUST NOT be interpreted as automatically establishing:

- epistemic ground truth;
- measurement correctness;
- independence;
- completeness;
- causal interpretation;
- representation insufficiency.

The reference value in the synthetic signal is part of the fixture scenario. A later scientific fixture should provide separately sourced reference/label authority when that distinction matters.

### 11.2 Typed-measurement limitation

The current basic `createObservation` payload stores the fixture measurements in human-readable `signal` strings rather than a typed measurement schema.

That is intentional for the first adapter smoke test, because it uses only the current Core constructor surface.

It is also a limitation.

A VER adapter may parse those signals for the experiment, but the result should record that the measurement structure came from an adapter transformation rather than from a canonical typed VER/Rosetta measurement contract.

A later Pack fixture should use explicit structured measurement/source artifacts if scientific comparison depends on typed values.

## 12. `rosetta.evaluation`

Current payload shape:

```json
{
  "evaluationId": "evaluation.<derived-suffix>",
  "summary": "...",
  "verdict": "deny | fail | partial | pass | unknown"
}
```

The fixture includes bounded local evaluations of:

- pre-calibration absolute error;
- calibration action completion;
- post-calibration absolute error/local correction effect.

Scientific boundary:

The Rosetta `verdict` here is a bounded evaluation verdict for the declared local check.

It MUST NOT be equated with:

- VER insufficiency status;
- vigilance status;
- representational adequacy;
- regime hypothesis;
- transition authority.

For example, the pre-calibration `fail` means the local fixture check did not meet its reference condition. It does not mean VER has diagnosed representational insufficiency.

## 13. Correction/intervention representation

The fixture intentionally does not mint `ver.correction_attempt`.

The correction is represented by ordinary Core composition:

```text
Action
  -> ToolCall
  -> Observation
  -> Evaluation
```

This directly tests one of the crosswalk's key hypotheses: that VER does not need a parallel execution spine merely to identify local corrective interventions.

A VER adapter may classify that chain as a local correction attempt while retaining the exact Rosetta CIDs.

## 14. Before/after effect

The synthetic values are:

```text
reference value: 100
pre-calibration observed value: 112
calibration offset: -12
post-calibration observed value: 100
```

This fixture therefore contains a deliberately easy local-corrective pattern.

That does not force a VER conclusion.

A scientifically conservative analysis might say:

- a bounded discrepancy was observed;
- a local deterministic correction was executed in the fixture;
- the post-correction recorded value matches the synthetic reference;
- this trace alone provides no basis for claiming explanatory resistance or representation insufficiency.

The absence of a deeper diagnosis is a feature of the test, not a failure.

## 15. `rosetta.receipt`

Current payload shape:

```json
{
  "claims": [
    {
      "claimType": "...",
      "confidence": 1,
      "evidence": [{"cid": "cid..."}],
      "statement": "...",
      "verdict": "pass"
    }
  ],
  "digests": [
    {
      "alg": "sha256",
      "cidRef": "cid...",
      "digest": "...",
      "of": "..."
    }
  ],
  "policyRefs": [],
  "receiptType": "...",
  "subjects": [{"cid": "cid...", "role": "..."}]
}
```

Fixture Receipt CID:

```text
cidv1-sha256-045c7a94fd613cccb51be2fe4dff7021e0696fa0bfee6ca00beab5307a067c0a
```

The fixture Receipt claim is intentionally narrow. It attests that the fixture records a calibration action and a post-calibration observation matching the fixture reference condition.

It explicitly does not attest:

- a VER diagnosis;
- scientific correctness;
- representational sufficiency/insufficiency;
- empirical validation;
- endorsement.

### 15.1 Receipt confidence caveat

A Receipt claim's numeric confidence belongs to that Receipt claim. It MUST NOT be reused as the VER scientific confidence for the episode.

## 16. Signed Receipt

The `signedReceipt` top-level object contains:

```json
{
  "receipt": {"...": "same Receipt Tile"},
  "signature": {
    "algorithm": "ed25519",
    "keyId": "interop.test.ed25519.v1",
    "publicKeyPem": "...",
    "signatureBase64": "...",
    "signedCid": "cid-of-receipt"
  }
}
```

Current Rosetta signing semantics sign the Receipt CID bytes with Ed25519.

For this fixture:

- the key pair is test-only;
- no organizational authority should be inferred from the key;
- local verification confirmed that the signature verifies over the declared Receipt CID.

Cryptographic validity establishes signature/CID integrity only. It does not establish scientific truth.

## 17. Receipt bundle

`receiptBundle` is the current implementation helper closure and is not itself represented as a Core Tile in this fixture.

Fields:

```json
{
  "bundleId": "bundle.<suffix>",
  "closureCids": ["..."],
  "evidenceCids": ["..."],
  "policyCids": [],
  "receiptCid": "cid...",
  "subjectCids": ["cid..."]
}
```

Its purpose is mechanical closure over declared Receipt references.

Scientific boundary:

A complete Receipt bundle means the declared closure can be fetched/verified. It does not establish that every scientifically relevant alternative, confounder, or measurement source has been considered.

## 18. `rosetta.tapestry`

Current Receipt-bundle Tapestry payload used here:

```json
{
  "dynamicTail": ["evidence/policy CIDs"],
  "receiptCid": "cid...",
  "requiredScope": "public",
  "stablePrefix": ["subject CIDs"],
  "subjectCids": ["subject CIDs"],
  "tapestries": ["receipt CID"],
  "tenant": "bootstrap",
  "totalTokens": 26
}
```

Fixture Tapestry CID:

```text
cidv1-sha256-d47239cd0e8023fc32b5202a0a5935e29f708509731904f5694ad830472ef4ce
```

Scientific boundary:

The Tapestry is a compiled context/closure artifact. It MUST NOT automatically become the `ver.representation_subject`.

A future representation subject may reference a Tapestry as one contextual component, but doing so requires an explicit scientific definition.

## 19. Parent graph

The fixture uses Tile `parents` to preserve explicit lineage/reference closure.

High-level shape:

```text
Run
 |
 +-- Action: pre-measure
 |    |
 |    +-- ToolCall: read
 |         |
 |         +-- Observation: value 112
 |              |
 |              +-- Evaluation: absolute error 12 / fail
 |
 +-- Action: calibrate
 |    |
 |    +-- ToolCall: calibrate -12
 |         |
 |         +-- Observation: calibration applied
 |              |
 |              +-- Evaluation: action completion / pass
 |
 +-- Action: post-measure
      |
      +-- ToolCall: read
           |
           +-- Observation: value 100
                |
                +-- Evaluation: absolute error 0 / pass

Receipt references selected evidence/subject CIDs.
Tapestry compiles the Receipt-bundle context.
```

Some Evaluations also parent the relevant Run/Action/evidence CIDs to make their bounded assessment target explicit.

### 19.1 Causality warning

A parent/reference edge records declared Rosetta lineage/dependency. An independent scientific adapter should not infer a stronger causal claim than the actual event semantics support.

In this synthetic fixture the scenario is intentionally deterministic, but that does not turn generic Rosetta `parents` into a universal causal-edge predicate.

## 20. Role index

`roleIndex` is a convenience map, for example:

```json
{
  "run": "cid...",
  "preCalibrationObservation": "cid...",
  "calibrationAction": "cid...",
  "postCalibrationObservation": "cid...",
  "receipt": "cid...",
  "tapestry": "cid..."
}
```

VER adapters SHOULD ultimately operate by Tile semantics/CIDs rather than treating these fixture-specific role names as protocol vocabulary.

## 21. Expected traversal

`expectedTraversal` lists the fixture's intended inspection order.

It exists to make the handoff friendly and deterministic.

It is not:

- a Rosetta Core field;
- scientific evidence of causality;
- a replacement for parent/provenance links;
- a temporal-duration record.

A VER adapter may use it as a fixture convenience, but should record that fact.

## 22. Proposed VER adapter behavior

A minimal adapter could perform the following without adding semantics to Rosetta itself.

### Step 1: verify transport and Tile integrity

- validate outer fixture shape;
- recompute canonical bodies and CIDs;
- verify Receipt signature;
- verify declared closure members are present.

### Step 2: build a Rosetta event graph

Index all Tiles by CID and resolve parent references.

### Step 3: expose candidate VER Trace objects

Candidate Trace inputs include:

- Run;
- Actions;
- ToolCalls;
- Observations;
- Evaluations;
- Receipt as provenance/attestation Trace if useful.

The adapter should preserve each exact Rosetta CID.

### Step 4: construct VER Evidence relations independently

The adapter or VER Core decides which Trace supports, contradicts, or fails to discriminate among which scientific propositions.

The Rosetta fixture does not predeclare those VER Evidence relations.

### Step 5: preserve insufficiency/underdetermination

If the trace cannot support a persistent residual, explanatory insufficiency, or regime conclusion, the adapter should report that limitation rather than manufacturing one.

### Step 6: return a provenance-preserving result

Ideally, each VER-side result points back to the exact Rosetta CIDs used and identifies any adapter-derived structures.

## 23. Suggested adapter output envelope for the experiment

This is an experiment suggestion, not a Rosetta or VER normative schema:

```json
{
  "experimentId": "VER-ROSETTA-INTEROP-0001",
  "inputFixtureId": "VER-ROSETTA-INTEROP-TRACE-0001",
  "inputRosettaCommit": "555503eead2f532bb133e3eaffd8f4dbacdf2a7a",
  "verSourceVersion": "arXiv:2606.13172v5-or-reviewer-declared-version",
  "verCoreVersion": "reviewer-declared",
  "adapterVersion": "reviewer-declared",
  "traceMappings": [],
  "evidenceRelations": [],
  "assessment": {},
  "unresolved": [],
  "translationLoss": [],
  "sourceCids": []
}
```

The VER team should of course use its own native result shape if preferred. Rosetta does not need to dictate VER Core's internal representation.

## 24. Falsification-oriented questions for this trace

The experiment is more valuable if it can fail cleanly.

Questions to record:

- Are Rosetta Run/Action/ToolCall/Observation/Evaluation semantics sufficient to identify useful VER Trace inputs?
- Does the absence of typed measurement fields materially impair faithful VER use?
- Are parent links sufficient, or does the adapter need an additional explicit edge/role contract?
- Is the equal `createdAt` behavior misleading for a temporal framework?
- Can VER preserve a local-corrective account without manufacturing representational insufficiency?
- Does the Receipt help provenance, or is its claim language too easy to misread as scientific authority?
- Can the VER output cite exact Rosetta CIDs without losing the distinction between Trace and Evidence?
- Does any essential VER v5 distinction require a new Rosetta Pack-local artifact?
- Which parts of the mapping are lossy or underdetermined?

## 25. Fixture role/CID inventory

| Role | Kind | CID |
| --- | --- | --- |
| run | `rosetta.run` | `cidv1-sha256-1da376229d31deeb922698167c72f00f342a9a2cea197ff09b2dc62fc6256cb2` |
| preCalibrationAction | `rosetta.action` | `cidv1-sha256-4c0b751527ad75f5bcef2bac61ffa7a87ee957e94adb388ca84d7e5b225a9568` |
| preCalibrationToolCall | `rosetta.toolcall` | `cidv1-sha256-2e9139e513d548798d51a2deadce42827ae4043db60868590d303afc833c2a5f` |
| preCalibrationObservation | `rosetta.observation` | `cidv1-sha256-dffd779a08c8e543eb7f04fadd7e40681b769a377d063b060fb8b0e2e69316c5` |
| preCalibrationEvaluation | `rosetta.evaluation` | `cidv1-sha256-69495c10bf99ba548dfb0fe32d819a9d13f84d738b87446bace170dc0d77642f` |
| calibrationAction | `rosetta.action` | `cidv1-sha256-a53d73e4e0f0f28c629a71431388c2550e0ba3d172169643c4ece8266f4ef4c3` |
| calibrationToolCall | `rosetta.toolcall` | `cidv1-sha256-060e0ccf8dc22d709fe556312761d8416bc3dc2089c23cf6f2509b875db7e7d9` |
| calibrationObservation | `rosetta.observation` | `cidv1-sha256-19b5fd0060244687315754a4daeb976b0345fe82963fe755bf77fec64c76b6a1` |
| calibrationEvaluation | `rosetta.evaluation` | `cidv1-sha256-d7d97d510bafae618ba2b837bada4acb256e8d49deb9a168af214f15946906a7` |
| postCalibrationAction | `rosetta.action` | `cidv1-sha256-a0a049e6b127d7fb4355101216221d30f31e90639ba6cd3455f4b850a91bc000` |
| postCalibrationToolCall | `rosetta.toolcall` | `cidv1-sha256-5205d3228a048857d86190c6798bab10924581a76367a4f23f456a7dd7af9df7` |
| postCalibrationObservation | `rosetta.observation` | `cidv1-sha256-4f033c9ecef31676dc1a4c8185db9b87c837c8cbaee0c11e996ea679adcbcae3` |
| postCalibrationEvaluation | `rosetta.evaluation` | `cidv1-sha256-1deb84462a61f612854699a4a19b71cc6c61f31ff91bb284f39667e0739347e9` |
| receipt | `rosetta.receipt` | `cidv1-sha256-045c7a94fd613cccb51be2fe4dff7021e0696fa0bfee6ca00beab5307a067c0a` |
| tapestry | `rosetta.tapestry` | `cidv1-sha256-d47239cd0e8023fc32b5202a0a5935e29f708509731904f5694ad830472ef4ce` |

## 26. Transport schema notes

`interop-trace-0001.schema.json` is intentionally permissive about individual Tile payload internals beyond the envelope contract.

Reason:

- the purpose of this schema is to validate this experiment's transport envelope;
- canonical Rosetta per-kind contracts remain owned by Rosetta packages/specification;
- the file must not become a shadow Core schema merely because it is convenient for one experiment.

The schema's `$id` uses a URN rather than an invented public HTTP schema URL.

## 27. What the next fixture should add after this smoke test

If the adapter experiment succeeds, a second, scientifically stronger fixture should add:

- explicit separately sourced measurement/reference authority;
- typed measurement values and units;
- real observation/event timestamps with explicit time roles;
- repeated observations sufficient to test a declared residual-family rule;
- at least one plausible local/measurement alternative;
- one intervention with measured effect;
- a case where two hypotheses remain live;
- a discriminating Probe contract and result;
- one `undetermined` outcome;
- one no-major-insufficiency control;
- one qualified-insufficiency case if a scientifically defensible synthetic construction is agreed.

That later fixture is where first-wave `ver.*` schemas should begin to prove value.

## 28. Recommended interpretation discipline

When inspecting this file, use these equations as guard rails:

```text
Rosetta Trace != VER Evidence
Observation != ground truth
Evaluation verdict != VER diagnosis
parent link != universal causal edge
Receipt validity != scientific correctness
Tapestry != latent representation
successful local correction != proof of global adequacy
failed local correction != automatic representation insufficiency
interoperability != empirical validation
```

If the independent adapter can preserve those distinctions while still producing useful VER-side structure, the experiment has done something scientifically meaningful.
