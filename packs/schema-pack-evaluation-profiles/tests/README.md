# Salience Evaluation Profile vectors

The nine vectors exercise public representation only. Each assessment inherits the evaluation's scope, valid time, receipt references, and provenance with dimension-specific evidence/provenance references supplementing them. Values use a declared representation and `schemaRef`; no vector discloses a formula, weight, gate, selection rule, or private procedure.

The invalid vector proves that a salience evaluation cannot carry a truth, execution, activation, or authorization grant. The interoperability vector has two compatible Profile payloads whose provenance differs without identifying or constraining the private method that emitted either assessment.

The JSON Schema rejects undeclared fields at every owned object boundary, uses the
Core verdict vocabulary, and checks value encodings and timestamp formats. The
TypeScript validator additionally checks cross-field constraints: ordinal level
membership, ordered validity intervals, and prohibition on self-supersession.
These rules are part of public conformance and require no protected access.
Unknown/unavailable assessments contain no value; observed/estimated Novelty
requires a non-empty baseline reference. Rich values use `representation: reference`
with `schemaRef` and `valueRef`; resolving that referenced value's schema remains
the receiving implementation's responsibility. Structural validity does not prove
evidence authenticity, freshness, scoring quality, or authorization.

## Counterfactual Evaluation Profile vectors

Nine authored synthetic cases cover equivalent results, a missed exception, worse
results, partial replay, excluded later evidence, a rejected live-effect attempt,
inconclusive verification, preserved prior/reassessment state and invalid production
activation. Existing StrategyEpisode (#1483), Experiment (#1502), promotion (#1475),
routing/evaluation (#1507/#1480), budget (#1495), benchmark (#1089), replay/tape
(#1035/#1038), receipts (#158) and effect-admission (#994) owners retain their meaning.
This Profile references those records without replacing their schemas or admission.

All owned object boundaries reject undeclared fields. `verdict` uses the existing
Core vocabulary; `disposition` separately records better, equivalent within declared
criteria, worse, inconclusive, invalid, non-replayable or unknown. Comparisons with
quality claims require referenced replay/comparator/verifier/quality evidence.
Measurements are reference arrays; absence never implies a measured zero.

Portable JSON Schema checks structural conformance, supported versions, evidence
presence and declared no-live-effect/sandbox posture. Public cross-field rules in
`validateCounterfactualEvaluation` additionally reject overlap between historical
inputs and declared excluded later evidence and self-supersession/later-reference.
A frozen `frontierRef` and `availableAt` identify the original evidence cutoff;
authority/policy/model/runtime/Profile/budget references bind its original context.
Resolving that frontier and verifying actual evidence availability are responsibilities
of the consuming implementation. Merely validating this record neither proves a
complete historical frontier nor enforces a sandbox. A rejected effect attempt has
its own denial receipt and preserves an invalid comparison disposition.

Later evidence may appear in present-day counter-evidence without entering historical
inputs. Reassessment is a new record referencing preserved prior state. Counterfactual
success grants no production activation, execution, promotion or write authority.
Public conformance uses no private candidate-selection or threshold policy.
