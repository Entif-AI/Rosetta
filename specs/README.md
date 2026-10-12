# Desired-state authority

`specs/` is the desired-state corpus for this development substrate; existing
Rosetta Core/Pack/Profile/governance authorities stay at their canonical locators.
Principles pick governing tradeoffs, architecture owns system boundaries, behavior
and API specs own observable contracts. Each source declares stable identity,
owner, governing authorities/principles and state. Every spec must be claimed by
implementation/motion; generated catalogs or code do not supply missing intent.

`in-development` identifies desired state under this draft review. `accepted`
requires source-owner review; a generator or implementation scan cannot promote it.
Merging a reviewed spec agrees on desired state, not proof of implementation.
Acceptance remains subordinate to Core and narrower accepted authorities. Never
silently rewrite desired state to match code. Amend the source in a reviewable Git
change; revise affected planned motion, notify active owners, and add successors
for frozen completed history. Git/GitHub store chronology, not a copied history DB.

The retained baseline contract distinguishes direct observation, inference,
authority, drift, ambiguity, unrequested behavior and missing authority. Retained
convergence reports carry stable finding/gap/severity/observed+governing refs,
remediation task/issue/plan refs, verification and admission summary. Missing
intent cannot close itself; open/contradicted or stale evidence blocks admission.
Nx executes pure checks and source-digest verification; coordinator mutation stays
uncached. Human semantic assessment remains required for new intent, rather than
pretending a file/digest check can infer arbitrary source behavior.
