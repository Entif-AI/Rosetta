---
description: Preserve upstream convergence assessment as structured evidence
---
Consume the existing upstream `speckit.converge` assessment; do not invent another
convergence algorithm or change spec/plan/constitution authority. Declare the bounded
inventory actually checked and verification refs, including for a zero-finding run.
Write a candidate using the packaged convergence.schema.json. Stable finding keys are
feature-local work identities, unchanged by prose, severity, gap-type or remediation
updates. Preserve baseline observation IDs, original intent source refs, distinct code
evidence refs, task refs and verification lineage. Missing authority stays explicit.
Unrequested behavior requires review; never automatically delete it.

Run `pnpm exec nx g @entif-ai/nx-governance:convergence --request=<candidate.json>
--output=<configured-artifact>.convergence.json`. The local governance configuration
may opt into `convergence: {artifactPath, sourcePaths}`. Declare every source path from
the generated artifact for cache correctness. Merge admission will require that exact
artifact, current source digests and zero open actionable findings. Remediation needs
verification; an accepted exception needs a resolved approved authority ref.

W4A may compare stable finding IDs, gap/severity counts and remediation lineage across
runs using these JSON artifacts. That evidence does not authorize adaptive policy,
authority rewrites, branch creation, issue creation or acceptance of exceptions.
