# Proposed project-context Profile v1

Status: **proposal / fixture-only**. Source: #1786 (OPCTX-003), parent #1784.
This governed extension composes Core Observation, Lattice Edge and Receipt
references with source identity (#506), bounded work lifecycle (#1509), role
assignments (#1785), and interaction/feedback references. It does not amend the
Core Spine or replace the work lifecycle contract. No schema record or structural
validation grants authority, establishes factual truth or implies current rights.

The Profile has three record kinds. A project is a durable subject, with a
project class, title, description, objectives, parties, role-assignment refs,
phases/milestones, governing policy refs, work refs, interaction and feedback
refs, status and lifetime. Work products identify versioned artifacts separately
from their product subject, producers and work, source, dependencies, status,
creation/publication and rights/licensing/disclosure references. Product use is
a separate typed relation with a role, so one product can be an input in one
project and deliverable or evidence in another. A by-product relation names its
originating project, bounded work and subject with rationale and provenance;
separate reuse, seeded or spawned relations retain the origin unchanged.

All records carry an opaque stable subjectRef, immutable recordId
(sha256 of canonical Trace JSON of the body), observedAt, validity,
provenanceRefs, receiptRefs, correctionRefs and an exact supersedesRef or null.
Known validity is a half-open interval [from, until), with null until open.
Unknown validity is explicit. Distinct revisions preserve stable subject and
kind; a relation's endpoints, kind, role and origin are stable for its identity.
Revisions append to one predecessor chain, strictly increasing observation time.
An initial revision starts a temporal segment. An effective-change revision
starts a later segment, including a prospective withdrawal, pause or role change.
At an effective cut, the latest started segment governs; an expired segment
does not resurrect an earlier state. A correction names the exact current
revision of the affected temporal segment separately from the observation
predecessor. It may correct an older segment without replacing later segments,
and must cite correction evidence. Corrected segment starts must remain
strictly ordered. Unknown validity remains unresolved rather than guessed.
Historical observation cuts preserve what was recorded before correction.
Exact duplicate records are idempotent.

Membership is proposed as an explicitly distinguished project child-to-parent
relation with at most one active parent and no cycles in a declared closed
slice. This is a candidate topology, not a Core restriction on other graph
relations. Related/dependency/participation/product relations never imply
membership or permission. Reparenting records a prospective withdrawal of the old membership and
opens a distinct new relation in one supplied observation cut. A conflicting
overlap is rejected; unresolved endpoints, unknown membership validity, or
incomplete supplied coverage yield unknown closure, not inferred nonexistence.
Both effective time and observation time are required. An inspection result
over supplied records is not an independently authenticated current frontier,
a transaction, or proof that no other records exist.

The structural authority-composition helper compares an independently supplied
exact resource scope and authority envelope with the selected project revision,
declared role-assignment reference, policy/version/frontier and source frontier.
It returns structural agreement or unresolved, never permission. Inherited
membership cannot widen the exact resource scope; current Guard and external
role/rights resolution remain required.

References are intentionally opaque. Resolution, external authority and rights
checks, authorized atomic multi-record publication, actual conformance of
referenced artifacts and acceptance of this proposed vocabulary/topology remain
separate gates. The fixture validator does not schedule work, select actions,
deduce permissions from membership or set a universal source-of-truth store.
