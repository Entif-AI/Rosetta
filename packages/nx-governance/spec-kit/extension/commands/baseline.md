---
description: Capture bounded brownfield observations and reconcile existing authority
---
Resolve a bounded file list from the requested target, path, glob or Nx project before
reading source. Inspect only those code, test, interface, schema, route and validator
files necessary to understand the requested behavior. Search existing governing
artifacts first; read the approved authoritySources from the local governance config.
If additional authority is needed, resolve it through the project's authority process.

Author a candidate JSON using the packaged baseline.schema.json. Each claim has a stable
key, direct/inference kind, confidence, exact evidence line refs, governing authority
refs, conflict refs and reconciliation rationale. Nearby comments and tests do not
become normative requirements. Report implementation/test conflicts together. Missing
authority remains authority-missing; neither code nor this projection creates intent.

Run `pnpm exec nx g @entif-ai/nx-governance:baseline --request=<candidate.json>
--output=<feature>.baseline.json`. The generator binds the exact Git revision and
source digests. This is a resumable evidence projection; inspect its bounded source refs
on resumption rather than rediscovering the repository. Changed digests require review.
Use its stable observation IDs for subsequent planning/convergence. Propose work only
after reconciliation; authority-missing/ambiguous records first require resolution.
Never call feature/branch creation or overwrite spec/product/semantic authority.
