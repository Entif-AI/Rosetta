---
id: entif.research.indranet
slug: indranet-research
title: 'IndraNet: Vectorized Meat-Space for Spatial Twins and Embodied AI Governance'
kind: research
status: published
published: 2026-09-28
authors:
  - Crates McDade
description: A technical proposition for a shared physical-context exchange across spatial twins, embodied AI, XR, robotics, live performance, simulation, and receiver-side reconstruction.
tags:
  - research
  - spatial-computing
  - embodied-ai
  - digital-twins
  - provenance
  - interoperability
  - xr
projects:
  - indranet
  - rosetta
routeTag: research
related:
  - entif.project.indranet
  - entif.project.rosetta
sourceRefs:
  - IndraNet v0.5.0 public-candidate projection
  - entif-ai/indranet v0.5.0 candidate repository
  - Rosetta v3.0.0 Core Spine Specification
report: ETR-2026-06
version: 0.5.0
review: 'Author-review technical proposition · synthetic/reference validation passed with named limits; external review, live standards-runtime study, vendor interoperability, and neural receiver evaluation pending'
evidenceCutoff: '2026-09-28'
featured: true
noindex: false
---

## Narrow-Waist for Physical Context, IRL Threat Detection, Embodied AI, XR Avatars and Hi-Fi Broadcasting

Crates McDade | Entif.AI  
ETR-2026-06 | Technical proposition and candidate integration package v0.5.0  
Prepared 28 September 2026 | Selected primary sources refreshed 28 September 2026 | Author review draft

## Abstract

IndraNet proposes a common exchange boundary for physical-world context: what was reported, where and when it applies, which interpretation produced it, what remains uncertain, and how another system may use it. The aim is to connect specialist sensing, locating, scene, robotics, simulation and media systems without replacing their strongest capabilities. Its independently usable Core carries typed spatial state and evidence relationships. An optional Rosetta v3.0.0 companion represents that exchange through immutable Tiles, interpretation chains and execution receipts. Neither requires the other system's private inference machinery.

The proposal develops three connected contributions. First, it treats physical context as a revisable, purpose-scoped history rather than a stream of unqualified poses. Second, it specifies how mature standards can carry that history through explicit mappings, preserving their original identities and meanings. Third, it develops Generative Reality: a pre-positioned scene or event prior, dynamic state, and selective appearance witnesses, negotiated by a receiver according to the experience and fidelity it needs. Live performance provides the initial demonstration, with robotics, industrial twins, shared XR, privacy-minimized situational awareness and remote presence as related application families.

The companion reference implementation makes part of this architecture executable. It includes a standalone record module, a candidate Rosetta Pack, standards-profile codecs and seven labeled research-reference integrations. Local tests exercise 270 synthetic records, two loss-preserving selected-field profiles and six contextual stories. These artifacts establish inspectable examples, not deployed interoperability or the performance of an unbuilt neural decoder. The larger opportunity is a reusable physical-context contract through which independently developed systems can cooperate while retaining control over their own sensing, reasoning, rendering and action policies.

## The proposition

A performer raises a hand. A tracking system reports motion. A lighting console knows which fixtures are available. An audio engine knows which sound is playing. A camera system knows which performer it is following. An XR application knows where it last placed a virtual object. Each system may be working correctly, yet none necessarily knows what the gesture means in the current scene.

IndraNet begins at that junction. It proposes a shared physical-context architecture through which specialist systems can contribute what they know, preserve how they know it, and receive the part of a changing world that matters to their work. It would connect rather than replace positioning systems, sensor APIs, robotics middleware, scene formats, rendering engines, digital twins, and emerging executable-world models. IndraNet Core is independently useful: it describes qualified state and its relationships without requiring Rosetta. The optional Rosetta companion adds a common semantic and execution trace for participants already using that ecosystem. It maps content identities, observations, interpretations, contextual frames, alternatives, evaluations and bounded attestations without making Rosetta the owner of an external standard. [L01, L02, L04, L11, L12]

The ambition reaches beyond a responsive stage. The same architectural discipline could help a warehouse fleet, an XR technician, an AI participant, a public-space operator, a simulation service, and a remote attendee refer to shared physical evidence without requiring identical software or identical purposes. A robot may need occupancy and uncertainty. A technician may need a maintenance history anchored to the correct machine. A remote attendee may need geometry, motion, sound, and selectively refreshed appearance. These are different products of a shared evidential history, not different names for one universal view.

A particularly ambitious branch is Generative Reality: prepare a world or event package in advance, communicate dynamic state and fresh appearance witnesses, and reconstruct an appropriate experience at the receiver. Recent work on persistent world state, executable physical models, neural rendering, and semantic-conditioned video provides ingredients for that proposition. This prospectus develops the architecture connecting them; it does not assume that any single source has already supplied the complete system. [S14, S34–S42]

The earlier IndraNet reference study remains useful engineering lineage. Its finite records could be carried by existing standards with explicit profiles and mappings. That result removes a possible obligation to invent another foundational spatial format. It leaves the more interesting design work: making shared context, interpretation, change, process, and consumer-specific use intelligible across the systems already being built. [L09]

This edition develops that work through twenty linked propositions, six contextual stories, an independent native contract, a candidate Rosetta Pack, and a runnable context prototype. It is an invitation to researchers, vendors, standards communities, creators, and operators to recognize the piece they already own and imagine what could become possible at its interfaces.

## How to read this prospectus

The main text develops the architectural argument and its applications. The Technical Architecture Blueprint specifies service boundaries and operational behavior. The Candidate Interoperability Profile defines the exploratory exchange contract. Six use-case blueprints detail the scenarios. The Generative Reality companion expands the most speculative transport and reconstruction branch. The Proposition Registry preserves all twenty original directions, including their source lineage and prototype paths. The implementation package makes a bounded subset executable.

The labels used throughout have a specific purpose. **ESTABLISHED** means supported by the inspected source or specification within its stated scope. **IMPLEMENTED** means demonstrated by code in this package. **PROPOSED** identifies the architecture developed here. **SPECULATIVE** identifies a farther-reaching capability whose feasibility depends on unresolved work. **SIMULATED INTEGRATION** means an interface example without a verified upstream runtime connection. **RESEARCH QUESTION** identifies a later empirical question. A research paper's reported capability remains attributed to that paper, not promoted into an IndraNet result.

The publication is a working architectural prospectus. Standards retain their own authority. Candidate schemas and profiles are not accepted ROCK specifications. No named organization is represented as an IndraNet partner, customer, or endorser. Source keys in brackets resolve to the references and source registry; project-lineage keys identify the supplied material and preserved archives.

## Operational definitions

**IndraNet Core.** The independently usable candidate agreement for qualified physical-context records, relationships, lifecycle and consumer interpretation. It may be carried by existing standards and is not claimed to require a novel wire format.

**World Observation.** A preserved source report or received artifact under a declared origin. It records what was obtained, not an automatic assertion of world truth. A received simulation remains evidence of that received simulation.

**World State Claim.** A typed assertion about an entity or event, tied to frame, time, quality, source and purpose. Alternative claims may coexist.

**Epistemic role.** The declared relationship between an artifact and evidence: reported measurement, human report, inference, prediction, simulation or synthesis. The role is not a calibrated probability.

**Mapping loss.** A declared distinction, quantity, relationship or precision that is omitted, approximated, unsupported or context-dependent during translation.

**State revision.** A new immutable record that corrects, supersedes or retracts a prior claim without rewriting its evidence or earlier knowledge-time history.

**Generative Reality.** The proposed prior + dynamic state + witness architecture for receiver-side reconstruction of a physical event or place. No working neural decoder or bandwidth advantage is claimed here.

**Evidence-faithful reconstruction.** A reconstruction constrained by a declared task-specific evidence test and disclosure of unsupported appearance. It is not synonymous with visual plausibility or a witness reference alone.

**REFERENCE_ADAPTER.** Executable or implementation-ready code grounded in a declared external contract but not exercised against the intended live external implementation.

**SIMULATED_INTEGRATION.** An explicitly invented external boundary used to exercise architecture when sufficient upstream interface detail or runtime access is unavailable.

**Candidate Pack.** An unaccepted local Rosetta extension package using existing Core meaning and namespaced domain payloads. Its content identity is not a canonical ROCK allocation.

**Qualified shared context.** A purpose-scoped view over an evidence history, with time, uncertainty, conflict and use restrictions intact; not a universal consensus state.

## 1. A room becomes an instrument

The original problem was not to invent a digital-twin category. It was to make a room respond coherently to a performer. The studio contained instruments, looping and effects equipment, cameras, lighting, projection, and a controller whose buttons and motion could select different operating modes. The performer wanted gestures and movement to participate in the performance without manually touching every subsystem. The room itself was becoming the instrument. [L06]

This origin matters because it reveals a distinction that a diagram of sensors and arrows can conceal. A hand position is a measurement. A gesture is an interpretation of movement. A command is an interpretation of that gesture within a mode, by an actor with authority to control something. The three may occur in quick succession, but they are not interchangeable. A performer reaching for a glass should not trigger the same effect as an intentionally armed gesture. A lighting rehearsal should not unexpectedly change the audio mix. The current scene, operator intent, and interaction grammar belong in the model.

Consider a simple sequence. A performer selects a scene called “storm.” The control surface acknowledges the selection, the relevant systems report readiness, and the XR display changes to the scene's visual language. The performer then rotates a wrist. In this scene the motion changes the apparent position of a sound and the intensity of a projected field. Later, the performer selects “close-up.” The same wrist movement changes a camera framing request instead. The physical movement has not acquired a permanent meaning. Its meaning has been supplied by the active context.

A conventional integration can certainly implement these mappings. The proposal is not that context-dependent control is unprecedented. The question is whether the context and its relationships can become reusable, inspectable artifacts instead of remaining scattered through custom scripts, console presets, application variables, and human memory. If a camera operator asks why a request was generated, the answer should identify the gesture interpretation, the active scene, the actor's control role, the mapping version, and the source evidence. That explanation should not require the original integrator to remember which script contained the rule.

![One gesture, different meaning. The same physical input can produce a different proposed effect when its context changes. Architecture proposal; no live control was performed. Sources: L01, L06, E02.](/research-assets/indranet/graphics/F01.svg)

**Figure F01. One gesture, different meaning.** The same physical input can produce a different proposed effect when its context changes. Architecture proposal; no live control was performed. Sources: L01, L06, E02.

### 1.1 The mode is part of the event

The original controller was particularly revealing. Its role was broader than a collection of MIDI values. It selected banks of meaning across the room. A useful IndraNet event therefore carries or references the mode under which it was interpreted. “Wrist rotation” and “wrist rotation while the spatial-audio layer is armed” are different application events even if the sensor values match. The mode transition itself is a recorded action with a before-state, an after-state, an initiating actor, and an effective interval. [L06]

This leads to a practical interaction pattern. An explicit clutch or arming action separates ordinary movement from control movement. A context binding specifies which gestures are meaningful. A consumer projection converts an accepted interpretation into the consumer's native control vocabulary. The resulting OSC message, camera request, or scene update remains a projection of the interpretation, not the canonical definition of it. An audit consumer can retain the full chain while a low-latency device consumer receives only what it needs.

Such a design can also improve creative iteration. A choreographer might replay a captured movement sequence through several scene mappings. A lighting designer could adjust the interpretation without changing the recorded movement. A sound designer could attach a different response to the same semantic event. A remote performer might rehearse inside a local reconstruction of the room. The reusable object is not merely a motion-capture file. It is motion together with context, mappings, and the ability to distinguish what happened from what a particular creative configuration made of it.

### 1.2 From an instrument to a place

Once the room has persistent entities, coordinate frames, event history, and contextual interpretations, other applications become easier to imagine. An XR panel can remain associated with the correct instrument. An AI assistant can refer to the camera the performer just approached. A technician can inspect a fixture's calibration history. A remote participant can receive a view of the same scene. These consumers need different information, but their references intersect.

The transition from stage to general spatial architecture is therefore not a change of branding. It is a change in the unit of reuse. At first the integrator is connecting devices. Next the integrator is connecting interpretations of a place. That place includes physical entities, their relations, active processes, permitted actions, and uncertainty about current conditions. A warehouse and a theater differ radically in their operational purposes, but both confront identity, time, coordinate alignment, conflicting reports, and context-dependent action.

The original discussion explicitly widened the idea to warehouses, robotics, public environments, transit, sports, industrial sites, and remote presence. Live entertainment remained the lighthouse: a setting where a shared physical context produces immediately visible effects. It was never intended to become the boundary of the project. [L01, L02]

### 1.3 The first useful demonstration

A compelling first demonstration does not need a simulated city. It needs a room, one tracked participant or recorded track, one explicit mode control, and two unlike consumers. The demonstration should let an observer inspect the difference between the movement, its interpretation, and the output requested from each system. A replay should show that changing the context changes the result without rewriting the original evidence.

This package implements that pattern offline. It does not supply a performance-ready gesture recognizer. Instead, it provides a place where such a recognizer's outputs can be represented, joined to context, projected, and examined. A sensing partner can replace the fixture stream with a documented output. A production partner can replace a dry-run message sink with an authorized integration. Neither needs to own the entire architecture to make the demonstration more real.

The room is valuable because it keeps the proposition tangible. Shared semantics should eventually be audible, visible, and useful. The architecture earns attention when a person can ask, “Why did the room respond that way?” and receive a traceable answer that connects the physical action to the creative intent.

## 2. A fragmented frontier with increasingly compatible pieces

The physical-world technology frontier contains several different kinds of progress. Positioning systems estimate where things are. Spatial reconstruction systems build geometry. Scene graphs organize entities and relationships. Digital-twin platforms connect operational data to assets and processes. Robotics systems navigate and act. XR runtimes place human interaction inside spatial contexts. World-model research predicts or generates future observations. Executable-world systems make proposed physical mechanisms runnable. These are adjacent achievements, but adjacency is not integration. [S01–S09, S14–S38]

The fragmentation is partly productive. A locating standard should not have to become a rendering engine. A scene-description format should not have to decide whether a sensor report is trustworthy. A robot coordination platform should not have to define every artistic or archival meaning of a physical event. Specialization allows each community to solve a difficult problem with appropriate expertise. The opportunity is to preserve that specialization while making the interfaces between it more expressive.

This is not an empty market awaiting a single universal platform. KINEXON describes a multi-technology industrial orchestration platform. BlackTrax and zactrack already connect tracking to several production systems. Open-RMF already addresses multiple robot fleets and building infrastructure. NGSI-LD, SensorThings, and AAS provide substantial integration foundations. An honest proposition must recognize these capabilities rather than manufacture a world in which everyone else merely emits disconnected coordinates. [S01, S02, S43, S44, S48, S51, S52]

IndraNet's proposed contribution is a cross-domain architecture for relationships that remain important when these systems meet: which evidence a state depends on, which interpretation is active, which alternatives remain possible, what process produced a result, what changed, and which consumers may use which projection. Some of that can already be represented with existing standards. The architectural work is to make the combination usable through agreed profiles, executable mappings, and concrete demonstrations.

![Connect specialist systems. Conceptual ecosystem map. Existing standards and products remain authoritative for their native meanings; arrows imply proposed exchange, not vendor integration. Sources: S01, S02, S04, S05, S06, S07, S09, S52.](/research-assets/indranet/graphics/F02.svg)

**Figure F02. Connect specialist systems.** Conceptual ecosystem map. Existing standards and products remain authoritative for their native meanings; arrows imply proposed exchange, not vendor integration. Sources: S01, S02, S04, S05, S06, S07, S09, S52.

### 2.1 The same noun can conceal different objects

“Position” may mean a raw measurement, a filtered estimate, a planned destination, an animation transform, or a predicted future state. “Object” may mean a database asset, a visual instance, a tracked radio tag, a scene node, or a physical thing to which several of these refer. “World model” may mean a spatial memory, a dynamics model, a scene simulator, or a generative video system. Treating these words as interchangeable creates integration problems that are semantic before they become computational.

An IndraNet profile should therefore expose distinctions at the point of exchange. A tracked tag may be associated with a performer for one session. That association is not the performer's identity. A map object may be matched to an asset record with uncertain evidence. That match is not established merely because the labels are similar. A predicted door state may be useful to a planner while remaining unsuitable as evidence that the door is open now.

The practical benefit of this discipline is that systems can disagree without becoming unintelligible to one another. A scene graph and a radio tracker can contribute different accounts of the same area. An application may choose a view appropriate to its purpose while retaining the competing report. A later correction can change the active view without erasing the history that explains an earlier decision.

### 2.2 Why the research sources belong together

The supplied research corpus spans several layers rather than one research contest. DGSG-Mind, FUS3DMaps, OVI-MAP, and DSG are relevant to persistent spatial organization and changing scene structure. EmbodMocap is relevant to obtaining metric human-and-scene information. Cooperative-localization work is relevant to combining distributed constraints. These sources suggest ways to produce richer spatial evidence and interpretations. [S17–S19, S21, S23–S26, S30]

PhysMind and Code-as-World move the discussion toward executable explanations. Their relevance is not that they make the same representation as a locating API. They suggest that observed motion can be linked to a runnable account of dynamics. HoloAgent-0 is relevant to persistent spatial memory inside an embodied agent framework. MVISTA-4D and RynnWorld-4D connect predicted spatial-temporal representations to robotic action. Each contributes a different possible producer or consumer of an IndraNet exchange. [S14–S16, S20, S22, S31]

StateFlow, Marionette, and Programmable World Model are especially useful to the state-versus-appearance distinction. Their reported systems give explicit state a role separate from final visual generation. CG-World describes structured state, events, observations, and branch metadata in a computer-graphics-derived dataset and protocol. These are signs of a shared architectural interest, not evidence that the systems already speak a common interface. [S35–S38]

The synthesis proposed here is a set of handoffs. A persistent map contributes a revisioned scene. A physical model contributes a conjecture about its dynamics. A simulation contributes a possible trajectory. A renderer contributes an appearance conditioned on selected state. A consumer asks which of these objects it is receiving and why. Rosetta supplies a common way to keep those relationships visible while leaving each specialist's native model intact.

### 2.3 A convergence opportunity rather than a novelty monopoly

A useful proposition does not require claiming that no one else has imagined explicit world state. The source corpus already contains close neighbors. That is a reason to seek collaboration around interfaces, examples, and profiles. An architect can add value by connecting existing work, clarifying a recurring interface, and reducing the cost of building the next system. These contributions need not be recast as the invention of every ingredient.

The relevant novelty question is consequently granular. A particular mapping, reconstruction contract, context-preserving handoff, or operational mechanism may deserve investigation. The broad phrase “shared world state” does not establish priority or protectability. This prospectus leaves invention review separate from the task of making the architecture clear enough for others to critique and extend.

The invitation to an adjacent project is therefore practical: keep the system that already works; expose one bounded artifact or consume one useful projection; help identify the information that must survive the boundary. A collaboration can begin with a recorded trace and a shared question before it requires a consortium, a platform migration, or a declaration that one architecture has won.

## 3. Composition is the work

IndraNet should not begin by declaring ownership of every field in a physical-world record. It should begin by asking which community already owns the meaning and which agreement is needed to carry that meaning into another context. This yields an architectural sequence: adopt, compose, profile, extend, and only then invent. The order is useful because it keeps the shared contract small while allowing the applications to remain ambitious. [L04, L05]

NGSI-LD contributes an extensible context model and an API. SensorThings contributes a structured observation system. GeoPose contributes geographic pose exchange. omlox contributes heterogeneous locating-system integration. OpenUSD contributes scene description and composition. OpenXR contributes spatial interaction/runtime conventions. ROS tf2 contributes time-aware transforms inside robotic systems. VDA 5050 contributes a fleet-control exchange surface. None must become a universal physical-world language for the combination to be valuable. [S01–S09]

The earlier IndraNet reference study showed that its finite fixture could be preserved through explicit standards profiles and mappings. This is a constructive starting point. It means a proposed application can use familiar carriers rather than first requiring the world to adopt another general serialization format. The earlier result does not by itself demonstrate independent runtime interoperability, but that distinction need not dominate an architectural prospectus. The code and its test history remain available as a foundation. [L09]

### 3.1 Four kinds of agreement

Composition requires at least four different agreements. A syntactic agreement specifies how to parse a message. A semantic agreement specifies what its fields mean. A contextual agreement specifies when and for whom that meaning applies. An operational agreement specifies how state changes, failures, and requests behave across systems. A JSON object can satisfy the first agreement while leaving the other three unresolved.

For example, two applications may parse the same pose. One interprets the frame as a warehouse floor, the other as the robot's current local map. Both accept a timestamp, but one treats it as measurement time and the other as publication time. One uses the position as an estimate; the other presents it as ground truth. The messages are valid, yet the applications disagree about the world they describe.

An IndraNet profile should make these agreements explicit without absorbing the native standards. It can bind a pose to its source schema, a frame revision, an observation interval, an association record, and a permitted-use context. It can record which interpretation created a semantic event. It can declare whether a projection preserves, approximates, or omits a source distinction. The objective is not to put more metadata on every packet. It is to attach the right context at a stable, retrievable boundary.

![Compose standards, preserve their meanings. Selected-profile composition retains source meanings and explicit sidecars. The locating adapter is an independent reference, not tested omlox vendor interoperability. Both strong NGSI and composed profiles preserve the selected fields in the local round-trip exercise. Sources: S01, S02, S04, S05, E01.](/research-assets/indranet/graphics/F03.svg)

**Figure F03. Compose standards, preserve their meanings.** Selected-profile composition retains source meanings and explicit sidecars. The locating adapter is an independent reference, not tested omlox vendor interoperability. Both strong NGSI and composed profiles preserve the selected fields in the local round-trip exercise. Sources: S01, S02, S04, S05, E01.

### 3.2 Profiles are more than field lists

A profile becomes useful when independent people can construct the same kind of exchange without negotiating every detail again. That requires examples, failure behavior, identity rules, time conventions, and mappings. It also requires a clear account of what remains outside the profile. A pose profile that leaves calibration ownership unspecified may merely relocate a bespoke agreement from code into a meeting.

The proposed IndraNet profiles therefore include a producer declaration, source representation, interpretation record, context binding, projection contract, and change behavior. Some deployments will use all of these. Others may begin with a source-native event and a small sidecar binding. The common requirement is that a consumer can identify what it received, its evidential role, and the interpretation needed to use it.

This approach supports asymmetric adoption. A tracking vendor need not emit Rosetta Tiles from its firmware. An integrator can preserve the vendor's documented output and add the Rosetta representation at the application boundary. A consumer need not understand the entire IndraNet vocabulary to receive a native projection. The adapter is responsible for declaring the correspondence and its loss. The vendor remains authoritative for its protocol; the application profile remains responsible for how it uses that protocol.

### 3.3 Respect the semantics that already exist

External standards already contain more than transport mechanics. PROV-O provides provenance terms. SOSA/SSN describes observations and sensing relationships. STAplus adds ownership, licensing, and observation relationships to SensorThings. AAS includes asset semantics and has separate security and interface specifications. These should be reused where appropriate. Rosetta's proposed value is not that it invented provenance or uncertainty. It is the way its semantic and operational spine can bind such information to interpretations, processes, and working contexts across application domains. [S03, S10–S12, S51]

A standards composition map should therefore identify exact reuse, specialization, association, and loss rather than drawing every source into an undifferentiated central box. A provenance link can map to PROV-O. A native observation can remain a SensorThings observation. A physical entity's external asset identity can remain an AAS identifier. A Rosetta Concept or Frame can reference those anchors without claiming to replace their original identities.

Where a new domain term is useful, it should be namespaced and introduced with an example showing why composition needs it. “Current render contract” is a plausible application object. “Universal truth object” is not a useful shortcut. An executable-world hypothesis maps to existing Conjecture semantics and domain payloads when projected into Rosetta. Its native external representation remains a separately identified source artifact, not a rival Rosetta belief system.

### 3.4 Composition as a collaborative artifact

The most valuable output of a first collaboration may be an agreed mapping rather than a new product. Suppose a locating-system team and an XR team jointly define how a moving asset's association, frame, time, and uncertainty reach a headset. A robotics team can later reuse the asset association and frame binding while selecting a different uncertainty policy. A maintenance team can attach documentation through the same identity bridge. The shared mapping has become infrastructure for several applications.

This is the sense in which the union may become more capable than the parts. The claim is architectural and prospective: meaningful relationships can be reused across boundaries that otherwise require separate interpretation. The benefit must eventually be measured in real integrations, but it can first be made imaginable and implementable through a precise joint example.

### 3.5 A strong baseline is an asset, not an adversary

A serious baseline should be allowed to use the extensibility that its standards actually provide. In this revision, one local codec uses an explicitly declared NGSI-LD-style profile; another composes the same context with a SensorThings-style observation, a locating reference, and a GeoPose preview when the frame and orientation permit one. Both retain the source fields through an exact round trip over the selected native record surface. The comparison covers 270 synthetic records and 540 total round trips. It does not show that IndraNet requires a new universal carrier. It shows that the proposed agreement can be implemented above existing carriers. [E01]

The useful engineering question therefore changes. Instead of asking whether a sufficiently extensible standard can contain another JSON object, ask whether independent teams recover the same identity, frame, time, provenance, role, revision and permitted-use interpretation without undocumented side agreements. An explicit shared profile can reduce that repeated negotiation even when its underlying formats were already expressive enough. This is IndraNet's proposed contribution at the narrow waist.

The current codecs are reference mappings, not deployed standards stacks. They do not run JSON-LD expansion, a native NGSI-LD broker, a SensorThings server or an omlox Hub. The locating reference is independently specified because this run did not retrieve a usable official omlox machine schema. The full runtime comparison remains prospective and is separated from the local checks in the experiment package. That boundary prevents a useful round-trip test from being inflated into a vendor claim. [E01, E03]

The surrounding standards ecosystem is also advancing. The AOUSD repository lists Core Specification 1.0.1, VDA 5050 lists version 3.0.0, and the AAS Release 26-01 catalog lists its current component versions. The OpenXR 1.1.49 changelog includes the spatial-entity family of ratified extensions; their availability still depends on the runtime. The European Commission's Interoperability Test Bed describes work with ETSI's NGSI-LD conformance testing. These are integration resources to consume, not empty spaces waiting for a replacement. [S06, S07, S09, S51, S56]

## 4. An independent Core and a Rosetta companion

Rosetta v3.0.0 describes a minimal content-addressed spine with attachable Packs and a separation between received signals and their interpretation. Its glossary distinguishes Tiles, content identities, stable handles, external anchors, Observations, Forms, Lexemes, Concepts, Frames, Conjectures, Evaluations, and other artifacts. Its operational trace distinguishes a Run, Actions, ToolCalls, Observations, and Evaluations. The specification intends domain-specific meaning to attach through extensions rather than expand the constitutional center. [L04]

The Rosetta companion applies that philosophy to physical context. The independent IndraNet record contract remains usable on its own, including by a producer and consumer that never construct a Tile. A sensor's message is preserved as evidence of what was received. Parsing exposes its fields. A domain mapping explains that a field is a position in a particular coordinate frame. An association links the tracked identifier to a physical entity within a scope. A contextual interpretation identifies an event. A process may use that event to request an external action. Each step can be inspected independently.

The distinction is valuable even when all steps run in one computer. When they run across vendors, models, and organizations, it becomes a collaboration contract. The producing system does not have to disclose its entire internal algorithm to state what it produced, which evidence it used, and what the output claims. The consuming system does not have to treat the output as unquestionable truth to make use of it.

![Independent Core, optional companion. The top path executes independently. The lower path is an optional Rosetta projection with preserved native identity and epistemic role. Both are local reference implementations. Sources: L12, E01.](/research-assets/indranet/graphics/F04.svg)

**Figure F04. Independent Core, optional companion.** The top path executes independently. The lower path is an optional Rosetta projection with preserved native identity and epistemic role. Both are local reference implementations. Sources: L12, E01.

### 4.1 Three identities that must not collapse

A content identifier addresses a particular immutable artifact. A stable identity can connect successive representations of the same application entity. An external identifier remains governed by its source system. These roles are distinct in Rosetta's CID, RID, and XID terminology. IndraNet must preserve the distinction when it represents an object that has several names. [L04]

A radio tag's identifier may refer to a device. A warehouse management identifier may refer to an asset. An OpenUSD path may refer to a scene element. An XR anchor may refer to a spatial reference in a runtime. A physical object can be associated with all four without making the identifiers identical. The association needs scope, provenance, and a period of applicability. Moving the radio tag to another object should not silently move the object's maintenance history.

This suggests an association record rather than a destructive merge. A record can assert that a tag and an asset correspond during a particular session, with evidence and an explicit responsible party. Another record can contest or supersede that association. The consumer's current view can use the accepted association while an audit retains the earlier one. This is more work than a global lookup table, but it makes the work visible at the place where an integration otherwise hides it.

### 4.2 Interpretation is a chain, not a relabeling

A raw observation does not become a semantic fact because a parser accepted its syntax. Rosetta's interpretation layers provide a vocabulary for preserving that transition. In a physical application, a Form may expose a structured measurement or a source span. A domain vocabulary can anchor the measurement type. A Frame can bind the subject, property, time, location, and context. A Conjecture can retain competing interpretations when association or event recognition is ambiguous. [L04]

The purpose is not to force an English-language pipeline onto every sensor sample. It is to keep the interpretive commitments inspectable. A high-rate stream can remain in its native storage and be referenced through a sample range or chunk manifest. A semantic event can point to the relevant range rather than duplicate every sample. The application should be able to recover the evidence and the mapping under which it was interpreted.

A useful consequence follows for AI participants. An agent can ask for the evidence behind “the loading area is blocked” and receive the observations, entity associations, and contextual definition that support that interpretation. It can distinguish “the camera reported an object” from “the planner predicts that the object will obstruct the route.” The natural-language explanation becomes a projection of a structured trace rather than the only place where the distinction exists.

### 4.3 Conjectures make disagreement usable

Many physical-world integrations are tempted to expose one preferred value and hide the alternatives. That can be appropriate inside a tightly controlled estimator, but it is a poor universal exchange assumption. A visual system may associate an object with one track while a radio system suggests another. A simulation may explain a trajectory under several plausible parameterizations. A human operator may provide a correction that is not yet corroborated.

Within the Rosetta companion, Conjectures provide the existing home for candidate interpretations and uncertainty; the Pack should reuse that home rather than invent a rival universal hypothesis kind. Outside Rosetta, the native IndraNet contract can represent a proposed state, alternatives and explicit epistemic roles without depending on a Rosetta runtime. A spatial profile can specify the candidate payloads, evidence anchors, and interpretation layer. It should also make clear whether a weight is a calibrated probability, an uncalibrated score, or simply an ordered preference. The absence of a calibrated probability is not a reason to erase alternatives.

This creates a useful interface for research systems. An executable model can be attached as one candidate explanation. A second model can remain live beside it. An Evaluation can record how each behaved under a named comparison. A later refinement can create a new immutable candidate. The receiving application can use the result without confusing a successful comparison with proof of a unique physical cause.

### 4.4 Process is part of meaning

A request to “move the camera toward the performer” is not merely a pose. In the Rosetta companion it becomes an Action within a Run, with an initiating actor, a purpose, a target, and an intended effect. A ToolCall invokes a particular adapter. The resulting Observation reports what the adapter or device returned. An Evaluation records a bounded assessment. A Receipt, when actually signed and represented under the relevant contract, can attest to an event or artifact. An ordinary log is not automatically a Rosetta Receipt. [L04]

These distinctions let IndraNet connect physical context to executable processes without claiming sovereignty over every device. The tracking layer supplies evidence. The interpretation layer proposes an event. The application forms an intent. A separate admission boundary checks authority and current conditions. The existing controller still decides or executes within its own domain. The resulting feedback returns to the evidence history.

A stage operator, a fleet manager, and an XR assistant may all use that pattern, but their policies are different. The common trace does not require one universal decision algorithm. It requires enough shared meaning to understand what was requested, what was authorized, what was attempted, and what was observed afterward.

### 4.5 The ELPQ matrix belongs beside, not inside, measurement uncertainty

The supplied Core specification includes the ELPQ family of evaluative axes: Ethos, Logos, Pathos, and Quixote. In its intended use, these concern ethical alignment and trustworthiness, logical coherence and truthfulness, emotional appropriateness or resonance, and creative or non-utilitarian value. An IndraNet application can use versioned matrices to describe how an experience or action is evaluated. It should not rename these axes into unrelated engineering quantities. [L04]

A production scene, for example, might be evaluated for consistency with the creator's intent, coherence between effects and gestures, suitability for the audience, and creative expressiveness. A maintenance assistant might emphasize justified evidence and appropriate communication. The axes need a declared rubric and evaluator. A number without that context is not portable judgment.

Position covariance, clock error, freshness, hazard severity, and model uncertainty remain separate technical objects. Quixote is not measurement uncertainty. Pathos is not a probability of collision. ELPQ does not turn a creative preference into a safety authorization. This separation allows a richer evaluative vocabulary without sacrificing the specialist quantities on which physical systems depend.

### 4.6 What independence means in executable terms

Core independence is an implementation property, not just an adoption slogan. The reference native module imports only the Python standard library. A producer can construct a record, validate its declared frame, decimal coordinates, event interval, knowledge time, origin, evidence parents, purpose restrictions and lifecycle, then compute its native digest. A second native participant can replay the record and obtain a purpose-scoped view without installing Rosetta. The test suite checks that module boundary. [E01]

The native content digest uses a clearly named IndraNet JSON profile. It is not called a Rosetta CID or a complete RFC 8785 implementation. The Rosetta bridge subsequently preserves the native bytes in an Observation of what was received, creates a separately typed domain projection, and links the two. A received simulated record is still an observation of received bytes, not evidence that the simulated physical event occurred. The record's spatial role survives the projection. [E01, L12]

This creates two useful entrances. A renderer or locating vendor can implement a small native profile. An Entif application can use the companion's richer evidence and process trace. Neither entrance silently changes the other's semantics. The producer need not disclose a proprietary fusion algorithm, and the consumer need not accept the producer's confidence score as a calibrated physical probability.

For the first public candidate, interoperability should be demonstrated at this boundary: two independently written participants, a pinned profile, withheld examples, and explicit failure cases. A passing local test is the start of that work. Independence is what makes the next participant's job bounded.

## 5. The proposed IndraNet architecture

The proposed architecture has a simple organizing principle: preserve evidence, represent interpretation, compose context, and project for use. It is not a requirement that every deployment run one monolithic service. The same contracts could be implemented within a venue workstation, across an industrial edge cluster, or through federated services. What should remain recognizable is the role of each boundary.

At the edge, producers emit native observations or source artifacts. A provider adapter preserves the message and records the source protocol, provider identity, time basis, frame reference, and acquisition status. A mapping stage produces domain interpretations with explicit source links. A context service maintains associations, relationships, scene or task modes, and applicable revisions. Consumers request projections under a purpose and rights scope. Processes may use those projections, but external effects pass through a separate authorization and controller boundary.

![Physical context, separated by responsibility. Proposed architectural responsibilities. Only bounded local reference subsets execute in this package; the external controller is not connected. Sources: L04, L12, E01.](/research-assets/indranet/graphics/F05.svg)

**Figure F05. Physical context, separated by responsibility.** Proposed architectural responsibilities. Only bounded local reference subsets execute in this package; the external controller is not connected. Sources: L04, L12, E01.

### 5.1 Evidence plane and interpretation plane

The evidence plane stores what was received and enough information to identify its source representation. It may contain native messages, sensor chunks, images, point-cloud references, machine events, or human annotations. A production deployment would usually keep large payloads outside the semantic graph and address them through manifests and bounded evidence anchors. The graph should not become a costly imitation of a high-rate signal store.

The interpretation plane records what the application makes of that evidence. It can express a pose claim, object association, occupancy interpretation, gesture event, predicted state, or executable conjecture. Interpretation records are immutable. A correction produces a new record and a relationship to the earlier one. This permits later consumers to distinguish a revised account from a rewritten history.

The separation also creates a clean partner interface. A sensing provider can deliver an estimate without adopting the application's event vocabulary. An application can attach the estimate to a semantic interpretation while retaining its original representation. When a mapping changes, the application can replay the preserved source rather than asking the provider to reproduce a past internal state.

### 5.2 Context service

Context is the subset of state and relationships needed to interpret a task or event. For a performance, it may include the active scene, armed gesture vocabulary, performer role, and permitted effect targets. For a warehouse, it may include the current work order, machine mode, zone ownership, and maintenance constraints. For a remote attendee, it may include the selected viewpoint, accessibility settings, rendering contract, and content rights.

The context service should not silently become a universal state oracle. It maintains explicit bindings with revision and validity. A consumer can request a snapshot at a particular knowledge point and event time. That snapshot is a view over the history, not a declaration that no other interpretation exists. The service should expose its omissions and unresolved dependencies.

A Rosetta Tapestry can serve as the compiled working context for an agent or process. Its purpose is narrower than an arbitrary archive. It binds a selected set of artifacts to a task, scope, and budget. A camera-planning agent and an incident-review operator may receive different Tapestries over the same place. The difference should be a consequence of purpose and rights, not accidental data loss. [L04]

### 5.3 Projection service

A projection translates the context into what a consumer can use. An XR projection may include geometry references, object anchors, and uncertainty overlays. A fleet advisory projection may include zones and their evidential status while omitting appearance. A production projection may emit OSC requests. An audit projection may expose the complete interpretation chain. A public-space dashboard may receive only coarse aggregates.

Every projection has a contract. The contract declares its input scope, output schema, semantic loss, maximum acceptable age, and allowed evidential roles. It also declares what the consumer must do when the input cannot satisfy those conditions. A renderer can show an unknown region. A dashboard can mark a stale estimate. A control-intent generator can decline to produce a request. These are useful outcomes, not exceptional failures to be hidden.

Projection boundaries are also where bandwidth and privacy become concrete. A robot does not need a person's face to know that an area is occupied. An attendee does not need industrial maintenance logs to enjoy a performance. A public dashboard does not need persistent individual trajectories to display crowd density. The architecture can reduce unnecessary information by defining the consumer's actual need before encoding its view.

### 5.4 Process and effect boundary

The process layer turns interpretations and goals into proposed actions. It may use a deterministic workflow, a human operator, an AI planner, or a simulator. The choice is implementation-specific. The shared contract records inputs, context, proposed effect, and subsequent feedback.

The effect boundary is separate. A request generated from a context snapshot may no longer be appropriate when it reaches a controller. Rights may have changed, a scene may have switched, a map may have been revised, or a hazard may have appeared. The request therefore binds the context on which it was based and requires a current check before execution. This is especially important when a low-latency application and a slower reasoning process share the same history.

IndraNet need not replace a robot's local safety functions, a show's emergency controls, or a building system's authority. It can provide contextual evidence and traceable requests to those systems. The controller's response becomes another observation. The architecture gains an accountable loop without pretending that semantic richness alone makes actuation safe.

### 5.5 Local operation and federation

A useful first deployment can be local-first. A venue gateway can preserve native streams, maintain a context store, and serve several local consumers. A separate service can receive only the artifacts required for remote viewing or analysis. The local system should continue useful operation when a remote model or cloud connection is unavailable.

Federation adds a different problem: two administrative domains may share a physical boundary without sharing all data or policy. A festival operator, transit authority, and building manager might exchange a limited zone or incident description while retaining separate identities and responsibilities. The contract should support scoped anchors and delegated access rather than assume one global registry can authorize everything.

The longer-term network proposition is a federation of interpretable contexts, not an omniscient database of the physical world. A place can publish a bounded description of its capabilities and permitted views. A participant can discover and request the relevant profile. The practical work is to make those limited agreements trustworthy and useful enough that broader cooperation becomes possible.

## 6. Identity, space, time, and uncertainty

Physical context is only as useful as its reference systems. A beautifully structured event can still be wrong for a consumer if it names the wrong object, uses an obsolete frame, or carries a timestamp whose meaning is unclear. IndraNet should treat identity, space, time, and uncertainty as explicit relationships, not incidental attributes appended after the application is built.

### 6.1 Identity is an association problem

An entity can have several representations at once. A forklift may have a fleet identifier, a tag identifier, a maintenance asset record, a visual track, and a scene node. Their correspondence is an assertion. It may be established by installation, operator confirmation, geometric evidence, or an automated association process. The exchange must preserve which method and evidence produced it.

The proposed profile therefore records associations as versioned, scoped objects. It permits one-to-many and unresolved cases where the source genuinely supports them. It does not force an early destructive merge. A technician moving a tag from one tool to another should create a new association, ending the old interval. A historical query should still reconstruct which tool a past alert was understood to concern.

The same principle applies to people, with stronger minimization requirements. A performer can be identified by a session role without publishing a persistent personal identity. A public-space observation can describe occupancy without identifying a person at all. A worker's operational role can be relevant to a task without making every trajectory available to every consumer. Identity scope should follow the application need rather than expand automatically with technical capability.

### 6.2 Coordinate frames are versioned evidence

A location value is incomplete without its frame, units, and convention. ROS tf2 illustrates the importance of time-aware transforms, while GeoPose provides explicit pose-exchange structures. IndraNet can reference these rather than invent a new geometry language. It still needs to record which frame definition and transform revision a projection used. [S04, S08]

Suppose a venue's tracking coordinate system is aligned to a reconstructed scene. A calibration procedure produces a transform. Later, an anchor moves or the scene origin is corrected. The new transform should not retroactively rewrite the earlier evidence. A projection made under the old alignment can be reproduced, while a new view can use the corrected transform. The relationship between them is a revision, not a mysterious jump in object motion.

![A pose needs a frame history. Conceptual coordinate and association contract. A frame change or tag reassignment must not silently rewrite historical evidence. Sources: S04, S08, S05.](/research-assets/indranet/graphics/F06.svg)

**Figure F06. A pose needs a frame history.** Conceptual coordinate and association contract. A frame change or tag reassignment must not silently rewrite historical evidence. Sources: S04, S08, S05.

A transform graph also needs failure behavior. Missing edges, cycles, incompatible units, expired calibration, and unavailable uncertainty must be visible. A consumer that cannot map an object into its own frame should receive a frame-resolution failure or a qualified view. It should not receive numerically plausible coordinates in an unspecified frame. The reference prototype implements a bounded transform resolver to make this failure behavior inspectable; a production implementation would adopt the appropriate specialist geometry and uncertainty machinery.

### 6.3 Several times belong to one event

Measurement time, source publication time, gateway receipt time, and interpretation time answer different questions. A delayed camera report may describe an earlier state more accurately than a newer but less informative sensor packet. A correction received today may concern an event yesterday. A consumer often needs both “what did we believe then?” and “what do we now believe happened then?”

The proposed architecture keeps event time and knowledge time separate. Event time locates the represented occurrence. Knowledge time locates when the application received or accepted a record into its history. A query can select both. This supports replay, late evidence, incident review, and reproducible agent context. It also prevents a late-arriving observation from silently masquerading as a newly occurring event.

Clock quality belongs beside the timestamp. A source can declare its clock basis and uncertainty, and a gateway can preserve that declaration. The application should not imply sub-millisecond ordering merely because its timestamp format contains many digits. A clock reset or synchronization loss should create a discontinuity that consumers can detect. Time precision is a property of the measurement and synchronization system, not of string formatting.

### 6.4 Uncertainty has several meanings

A localization covariance describes uncertainty in a measured or estimated quantity under a model. An association ambiguity concerns which entity a measurement belongs to. A classifier score concerns an interpretation. A prediction interval concerns a future outcome. Freshness concerns elapsed time and validity. These quantities may interact, but they should not be collapsed into one universal “confidence” field.

A consumer contract should identify the uncertainty it requires and the behavior when it is absent. A visual overlay might show a region rather than a precise point. A planner might require a conservative bound from its own validated subsystem. A performer effect might accept approximate position while refusing an ambiguous mode binding. An auditor might retain all alternatives without choosing among them.

The prototype uses explicit quality objects and deliberately avoids pretending that every provider's score is comparable. A production profile can later define conversions for particular distributions or measurement models. Until then, “unknown uncertainty” is different from “zero uncertainty.” Preserving that distinction is a small implementation choice with large semantic consequences.

### 6.5 The value of a qualified answer

A shared context service should sometimes return an answer with qualifications rather than a single number. “This object was last observed in this region, in frame revision seven, with an unresolved association to either of these tracks” is useful information. An application can decide whether it is sufficient for its purpose. Hiding the qualifications does not make the world simpler; it transfers the ambiguity to a consumer that no longer knows it exists.

This is one reason IndraNet is more interesting as a semantic application architecture than as a serialization format. Its job is to make the conditions of use travel with the represented state. The object becomes reusable because another system can understand both what it says and the circumstances under which it should be trusted, interpreted, or ignored.

## 7. Provenance, causality, and a world that can disagree with itself

A shared physical context needs more than a current-state table. It needs a way to explain how that table came to exist, what alternatives it excludes, and what a change means. Provenance, causality, and disagreement are related, but each answers a different question. Provenance asks where an artifact came from. Causal modeling asks what mechanism could produce an outcome. Disagreement asks which accounts remain incompatible or unresolved. IndraNet should connect these questions without collapsing them.

### 7.1 Provenance is useful before it becomes elaborate

A minimal provenance chain can already be valuable: source message, parser version, mapping version, interpreted state, and consumer projection. A field technician investigating a misplaced overlay can see whether the error entered at acquisition, frame alignment, entity association, or rendering. A production designer investigating an unexpected cue can see whether the wrong scene was active or the right scene used the wrong mapping.

PROV-O supplies a mature vocabulary for entities, activities, agents, and derivations. Rosetta can reference or project to that vocabulary while retaining its own content-addressed interpretation and execution artifacts. The proposed IndraNet profile uses provenance as a bridge between specialist outputs, not as a claim that every system must adopt one storage technology. [S10, L04]

A richer chain can include the exact evidence span, calibration record, model version, operator correction, and policy under which a projection was admitted. The amount of detail should follow the task. A rehearsal preview and an incident review have different evidence needs. Both benefit from explicit source identity, but neither benefits from indiscriminately copying every available byte into every consumer.

![A correction changes the view, not the past. Illustrative bitemporal revision. Labels t1/k1/k2 are symbolic, not measurements. The native and companion examples retain superseded evidence. Sources: E01, S01, L12.](/research-assets/indranet/graphics/F07.svg)

**Figure F07. A correction changes the view, not the past.** Illustrative bitemporal revision. Labels t1/k1/k2 are symbolic, not measurements. The native and companion examples retain superseded evidence. Sources: E01, S01, L12.

### 7.2 Four relationships often called “because”

In ordinary speech, “because” can refer to data dependency, temporal sequence, decision rationale, or physical cause. A system may say a light changed because a gesture occurred. That could mean the gesture detector emitted an event used by a mapping. It could mean the light changed after the gesture. It could mean an operator deliberately associated the gesture with the effect. It does not necessarily mean a scientific causal claim about the physical mechanism of either event.

The architecture should type these relationships. A derivation edge says an output used an input. A temporal edge says one event precedes another under a stated time basis. A process edge links a request to its execution trace. A causal conjecture refers to an executable or conceptual explanation that can be examined. A counterfactual branch describes an alternative course of events under changed assumptions.

This distinction lets a simulation participate honestly. A model can predict that a rolling object will reach a particular region. The prediction is a derived artifact tied to the model, initial conditions, and evidence. A later observation can be compared against it. Agreement can support the model for that comparison without making the model the unique cause of the observed trajectory. Rosetta's distinction between evidence and interpretation gives the application a place to preserve this nuance. [L04, L08]

### 7.3 Disagreement as an interface, not a nuisance

Suppose an optical tracker places an object near a doorway while a radio-derived estimate places it inside the room. The disagreement may result from occlusion, an incorrect association, a stale packet, a frame error, or ordinary measurement uncertainty. Automatically averaging the values can hide the real problem. A shared context layer should be able to retain the competing records and identify the basis on which a consumer selects or defers.

An application may legitimately use a preferred source for a bounded purpose. The preference should be explicit and should not destroy the alternatives. An audit view can show the full set. An XR view can show a uncertainty region. A production system can freeze a visual effect until the association is resolved. A robot's own validated perception and safety systems can remain authoritative for immediate motion while the shared layer records the discrepancy for other uses.

The same mechanism applies to semantic disagreement. A vision model may classify an object as a case; an asset registry may call it a battery pack; an operator may identify it as an empty transport shell. These statements can all be useful if their meanings, sources, and scopes are visible. A global “object class” field is too small an interface for that situation.

### 7.4 Revisions should change views, not erase reasons

A correction is an important event. If a tag was associated with the wrong asset, the system should represent the correction and the records it affects. Downstream projections can be invalidated or regenerated. Historical decisions remain linked to the context that was available when they were made. This preserves the difference between an error that was visible at the time and one discovered later.

The proposed reference architecture uses append-only records and explicit supersession or retraction relationships. Its current-state view is derived. This is an ordinary engineering choice in service of the semantic principle, not a requirement to retain personal data forever. Production retention and deletion policies must govern payload availability and access. A provenance record can indicate that an artifact was lawfully removed without pretending the original bytes remain accessible.

This makes collaboration easier to sustain. Partners can correct their outputs without agreeing to a fiction that the system was always right. A mapping can improve while earlier results remain reproducible. An interpretation can be revised without silently changing the source. The world represented by the system becomes something that can learn from disagreement rather than hide it.

## 8. Context turns events into executable processes

A shared state layer becomes more useful when it connects to work. A performance cue, a maintenance procedure, an XR instruction, and a robot task are all processes whose meaning depends on current physical context. IndraNet proposes to represent those dependencies so that a process can explain what it consumed and what it intended to change.

The same event can participate in several processes. An object crossing a zone boundary might update inventory, alter a visual overlay, trigger a camera suggestion, and contribute to a simulation's initial state. These consumers should not be forced into one universal workflow. They should be able to refer to the same evidence and maintain their own process semantics.

### 8.1 A context-bound event contract

A useful event record identifies the observed or interpreted occurrence, its subjects, the active context, its evidence, and its time. A process binding explains why that event matters to a consumer. The binding may refer to a scene, task, policy, or operator selection. It should be versioned so that a replay can reconstruct the same interpretation.

For the responsive room, the event might be “armed wrist rotation by the performer in the current audio scene.” For a warehouse, it might be “an asset associated with this work order entered the staging region.” For XR maintenance, it might be “the operator confirmed completion of this step while viewing the correct machine revision.” These examples show why raw coordinates alone are insufficient, but they do not require a universal ontology of every possible activity.

The candidate profile defines the common linkage and leaves domain vocabulary in separate profiles. A production profile owns its scene and cue terms. A warehouse profile owns its task and zone terms. Rosetta provides the shared artifact, interpretation, and process relationships. That is the narrow waist: enough common meaning to connect the processes, not a requirement that every process become the same.

![From context to a bounded action request. Conceptual process trace. The local performance fixture stops at serialized previews and refuses an obsolete context; no command is sent. Sources: E02, L12.](/research-assets/indranet/graphics/F08.svg)

**Figure F08. From context to a bounded action request.** Conceptual process trace. The local performance fixture stops at serialized previews and refuses an obsolete context; no command is sent. Sources: E02, L12.

### 8.2 Plan against a snapshot, execute against current authority

An agent or workflow needs a stable context to reason about. A snapshot lets it form a reproducible plan. But physical environments change while the plan is being formed. A valid plan at one moment can become inappropriate before its first effect. The architecture should preserve the snapshot while checking current authority and relevant state at the effect boundary.

A camera request can carry the scene revision and target association on which it depends. If the scene changes before the request reaches the camera adapter, the adapter can refuse or request a refreshed plan. A maintenance instruction can reference the asset and procedure revision. If the asset association is corrected, the instruction can be marked stale. A robot advisory can refer to a zone revision without claiming that the robot must obey an obsolete view.

This pattern is especially important for AI-assisted systems. A fluent explanation can conceal that a model reasoned over old context. The process trace should expose the context identity, not rely on the model to remember which facts were current. The model can remain one useful participant in the process rather than its uninspectable source of authority.

### 8.3 Intent, admission, attempt, and outcome

A requested effect, an authorized effect, an attempted effect, and an observed outcome are distinct artifacts. A production request may be generated but not sent. A device may acknowledge a request without achieving the intended physical state. A controller may refuse because local conditions changed. An operator may override the request. The trace should preserve these outcomes rather than reduce them to a generic success flag.

The reference implementation deliberately ends at dry-run intents for physical systems. This is an implementation boundary, not a retreat from the architecture. It creates a safe and inspectable place for partners to attach their real controller interfaces. The next step is not to let a speculative world model operate machinery directly. It is to define the controller's admission and feedback contract, then verify it in an appropriate setting.

A bounded Receipt can later attest that an adapter received or processed a request. It should not imply that the requested physical outcome occurred unless the attestation's evidence and claim actually cover that outcome. This is the same distinction that prevents a rendered image from becoming proof of an observed event. Both cases require the system to preserve what the artifact really establishes.

### 8.4 Human participation is a first-class interface

The system should make room for human interpretation and correction without treating those as unstructured exceptions. A stage operator selecting a mode is an authoritative input within that production context. A technician correcting an asset association is an evidence-bearing action. A public-space operator declining an alert is a meaningful disposition. These records help the system remain accountable and usable.

The design should also make refusal understandable. “No request produced because the mode changed” is more useful than “error.” “The object association is unresolved” is more useful than a missing marker. Good failure semantics are part of collaboration: a partner integrating one interface should not need to diagnose the entire system to understand why it declined to act.

This is where the promise of an executable world becomes concrete. It is not merely a model that can be simulated. It is a context in which processes can refer to evidence, preserve interpretation, request bounded effects, and learn from the resulting observations. The world remains larger than the model, but the model becomes a practical medium for coordinated work.

## 9. Partner-first sensing and localization

IndraNet does not need to win the sensing hardware war. The source discussion repeatedly identified strong existing providers as potential upstream collaborators. This is a strategic architectural choice: build around the evidence and state that specialists can expose, while keeping their localization, calibration, and perception machinery under their control. [L01, L06, L07]

The choice also prevents a false dependency. A useful context architecture should not require a custom radio, a particular headset, or a complete new sensor network before it can be explored. It can begin with recorded streams, existing systems, or a small controlled setup. A production deployment can choose sensing appropriate to its environment without changing the semantic purpose of the shared layer.

### 9.1 Different providers own different strengths

The live-production ecosystem already contains several relevant approaches. zactrack documents UWB tracking with lighting, audio, video, and other control interfaces. BlackTrax describes vision-based tracking and RTTrP-family integrations. TTA's Stagetracker II describes RF tracking and production-system integrations. Naostage's KAPTA uses multispectral sensing for beaconless tracking. These are examples of specialist capability, not interchangeable measurements or evidence of IndraNet compatibility. [S43–S46]

Industrial systems offer another set of interfaces. Pozyx participates in the omlox ecosystem. KINEXON describes multi-technology location and enterprise orchestration. ZeroKey describes acoustic positioning with calibration and fallback mechanisms. NavVis exposes authorized point-cloud access for third-party applications. Their relevance is that a partner-neutral architecture can consume different forms of spatial evidence without claiming to reproduce the underlying technology. [S47–S50]

The collaboration question is therefore not “will this vendor adopt our whole stack?” It is “what stable artifact or interface could this vendor contribute, and what useful consumer could we connect to it?” A first demonstration may need only position, identity, timestamps, frame metadata, quality information, and a recorded trace. Richer integrations can follow when the initial boundary proves useful.

![Partner-first sensing. Proposed modality-neutral participation. Existing product capability is attributed to its source; no commercial partnership or hardware test is implied. Sources: S05, S08, S43, S44, S52.](/research-assets/indranet/graphics/F09.svg)

**Figure F09. Partner-first sensing.** Proposed modality-neutral participation. Existing product capability is attributed to its source; no commercial partnership or hardware test is implied. Sources: S05, S08, S43, S44, S52.

### 9.2 A producer capability declaration

A provider declaration should describe what the producer can actually supply. It should distinguish position from orientation, a localization estimate from a raw range, a tracked object from a recognized entity, and a nominal update rate from a guaranteed service property. It should identify supported frames, time bases, quality fields, calibration references, and failure states.

The declaration also needs negative information. Does the provider expose covariance or only an accuracy class? Can it report loss of tracking? Does it reuse identifiers after a session? Can a client retrieve historical samples? Are timestamps generated at measurement or transmission? Which operations require credentials or a commercial agreement? These details often decide whether two systems can be composed honestly.

IndraNet's adapter contract should preserve the provider's answer rather than manufacture a richer one. If a source lacks orientation, the adapter should not infer it silently from a changing position. If the source lacks uncertainty, the adapter should mark that absence. If a field is an application inference, it belongs in a derived record with the responsible mapping or model identified.

### 9.3 UWB as a reference family

UWB is a useful reference because its architecture makes several integration issues visible: anchors, tags, calibration, measurement geometry, device association, time, and localization quality. Industrial UWB research on automatic anchor calibration and terrain-aware fusion demonstrates why a usable position estimate depends on more than a radio timestamp. The calibration and fusion engine can remain external while its outputs and relevant context enter the shared layer. [S17]

An IndraNet UWB-facing interface should separate at least four objects. The anchor network is an infrastructure configuration. A tag is a device. A localization output is an estimate produced under a configuration and time basis. An association identifies what the tag currently represents. An application event, such as “performer entered the light field,” is a further interpretation.

This separation allows providers to improve their algorithms without changing the application's basic vocabulary. It also lets applications change their interpretation without changing the provider. A theater can use the same position stream for a follow effect, a rehearsal visualization, and an XR overlay. A warehouse can use a location estimate for an asset view and a maintenance workflow while leaving immediate robot control to its own systems.

### 9.4 Cooperative sensing without magical devices

The original corpus explored whether many devices could contribute to a richer picture of a venue. That remains an interesting research direction, but it must be grounded in actual device capabilities and permissions. Ranging, communications, and radar-like sensing are different functions. A consumer device's UWB support does not imply unrestricted access to all of them. [L07]

Cooperative-localization research provides a more disciplined starting point: devices exchange bounded constraints under explicit timing and uncertainty assumptions. IndraNet could provide a participation and provenance contract around such systems. It should not require the localization algorithm itself to become public or assume that an arbitrary crowd of phones can be transformed into a reliable sensing array. [S23, S24]

A controlled prototype could begin with a small consenting device set. Each device declares its capability, contribution, clock quality, and withdrawal behavior. The context layer records which estimates depended on which contributions. A participant leaving the system should invalidate dependent assumptions rather than silently reduce an undocumented quality level. This makes cooperation a testable interface instead of an atmospheric promise.

### 9.5 Reference hardware has a narrower role

Open reference hardware can still be useful. It can make a research setup reproducible, help students understand the protocol, and provide a low-cost gateway for experiments. It should not become an accidental requirement that delays every software contribution. A recorded trace and a packet generator can already exercise identity, time, context, and projection behavior.

Hardware design, radio compliance, calibration, and installation safety deserve their own workstream. The present package specifies the software-visible boundary and supplies emulated inputs. That boundary is the useful common artifact for a hardware partner: a clear statement of the information a consumer needs, the assumptions it must not make, and the failure states it must handle.

## 10. Live performance: the room as a contextual instrument

A detailed live-performance architecture can make the whole proposition visible. The participating systems include a tracking provider, gesture or interaction recognizer, production-mode controller, audio engine, lighting console, media server, cameras, and optional XR clients. The IndraNet layer does not replace those systems. It supplies the shared context through which their outputs and requests acquire a coherent relationship.

The source genealogy includes a performer-oriented studio with instruments, looping, effects, cameras, projection, and a banked control surface. The important feature is not the exact hardware inventory. It is the ability to change the meaning of movement across a room-wide configuration. A prototype should preserve that structure rather than reduce it to a single position-to-light mapping. [L06]

### 10.1 The event-production topology

The tracking adapter records native pose messages and their frame/time metadata. A gesture interpreter references a bounded segment of that stream. The mode controller emits a context change when the performer or operator selects a scene. A context binder joins the interpreted gesture to the mode that was effective at the gesture's time. A production profile resolves the permitted effect targets. Consumer adapters then generate native requests for audio, lighting, media, or camera systems.

The shared model contains physical entities, scene entities, and process entities. A performer is distinct from a wearable tag. A light fixture is distinct from its control address. A camera is distinct from its current target association. A scene is distinct from the set of packets used to activate it. Keeping these identities separate allows equipment replacement and configuration changes without rewriting the meaning of the performance.

![The responsive-room fixture. Executed synthetic performance example: /indranet/demo/light/level = 80 and /indranet/demo/sound/send = 35. Both record sent:false and actuationAuthority:false. Sources: E02.](/research-assets/indranet/graphics/F10.svg)

**Figure F10. The responsive-room fixture.** Executed synthetic performance example: /indranet/demo/light/level = 80 and /indranet/demo/sound/send = 35. Both record sent:false and actuationAuthority:false. Sources: E02.

### 10.2 A concrete sequence

At rehearsal start, an operator loads a scene package and confirms the room alignment. The package identifies the mapping version, named zones, participating devices, and safe fallback behavior. The performer selects an audio-control mode. The system records a mode transition and exposes it to the performer's interface. A tracking stream reports motion; a recognizer classifies an intentionally armed wrist rotation. The interpretation references the motion evidence and the recognizer version.

The context binder produces a Frame containing the performer, gesture, scene, and intended control family. The audio projection converts that Frame into a dry-run OSC message. The lighting projection may produce no request in this mode. Later, the performer selects a lighting-control mode and repeats the gesture. The same recognizer output now participates in a different Frame and produces a different consumer request.

The prototype's value is the inspectable difference. An observer can see the same physical gesture, two context bindings, and two distinct projected effects. The mode is not a hidden variable in an application script. It is part of the explanation. The first live extension would connect the dry-run sinks to authorized test equipment while preserving the same trace.

### 10.3 Timing and synchronization

Performance systems have different timing behavior. Audio, lighting, video, and camera motion cannot be treated as one instantaneous effect. The architecture should represent the intended event time, source time quality, requested execution time, and observed feedback separately. OSC bundles provide timetags, but their presence does not guarantee that every receiving device schedules or executes identically. [S13]

A scene profile can declare which effects are tightly coupled and which can tolerate delay. A lighting transition may follow a semantic cue, while an audio parameter remains on a lower-latency local path. A visual projection may interpolate between state updates. The shared trace records the relationship without forcing all traffic through the semantic store on every sample.

This suggests two complementary paths. The fast path carries continuous control or tracking data through established production protocols. The semantic path records mode changes, event interpretations, parameter bindings, and selected evidence anchors. The paths meet at known boundaries. The semantic layer explains the control; it does not need to become an inefficient replacement for every real-time signal channel.

### 10.4 Rehearsal, improvisation, and override

A useful production system must support improvisation. The goal is not to force every creative act into a precomputed sequence. A performer can choose a scene, arm a gesture, or invite a system to respond within a bounded range. The active context defines that range. An operator can override or suspend an interpretation without deleting the motion evidence.

Rehearsal mode should be explicit. It can generate previews and record proposed effects without sending them to production devices. A replay can compare scene mappings. A technician can substitute simulated feedback for a disconnected fixture, with the simulation status visible. These are useful capabilities for design and troubleshooting, not merely concessions to incomplete integration.

A global override should remain simple and local. Its physical implementation belongs to the production system's appropriate control architecture. IndraNet can record the override and invalidate pending context-bound requests. It should not become the only path through which a human can stop an effect. Creative freedom is easier to sustain when the system's boundaries are understandable.

### 10.5 XR and audience participation

XR adds a participant-specific view of the same room. A performer can see spatial controls attached to instruments. A camera operator can see framing cues. A stage technician can see calibration and device status. A remote attendee can see a reconstructed or stylized representation. These views share anchors and scene context without exposing identical data.

Audience participation can also be modeled as a bounded contribution rather than a universal sensor mandate. An attendee might opt into an interaction zone, submit a gesture through an application, or influence a scene through an aggregate signal. The system should distinguish these intentional contributions from passive observation. The mapping between an audience action and a production effect should remain part of the scene contract.

The collaboration opportunity is concrete. A tracking provider contributes reliable pose or identity association. A show-control partner contributes an authorized native endpoint. An XR developer contributes a participant view. A research group contributes an interaction recognizer or generative effect. IndraNet supplies the shared context and trace connecting them, while each participant retains its specialist role.

## 11. XR, shared objects, and AI inhabitants

A person wearing XR glasses, a robot, an AI assistant, and a remote attendee may all refer to the same physical object. The hard question is not merely whether they can display its coordinates. It is whether they mean the same object, which account of its current state they are using, and why that account applies to their task.

OpenXR's spatial-entity extension family and OpenUSD's scene foundations provide useful building blocks. They do not remove the need for an application to connect a runtime anchor, a scene element, a physical asset, and an evidential history. IndraNet proposes to make those connections explicit through scoped identity and context bindings. [S06, S07]

### 11.1 The object shared by several participants

Imagine a mobile equipment case in a venue. A radio tag tracks its approximate position. A visual system recognizes its shape. An inventory system identifies its contents. An XR user points at it and asks an assistant whether it contains the camera adapter needed for the next scene. A robot may need only to avoid the case. A remote attendee should not receive its private inventory record at all.

The shared context begins with an association graph. The tag, visual instance, inventory record, and scene node remain distinct identifiers. A record explains which are associated with the case and under what scope. The assistant's response is grounded in the relevant association and inventory evidence. The robot's projection includes occupancy and uncertainty. The attendee's projection includes permitted appearance or geometry. The same physical referent participates in different views.

![One object, several legitimate views. Proposed consumer views over shared evidence. The reference exercises purpose filtering; accessibility and full XR runtime behavior remain design work. Sources: S07, E01, E02.](/research-assets/indranet/graphics/F11.svg)

**Figure F11. One object, several legitimate views.** Proposed consumer views over shared evidence. The reference exercises purpose filtering; accessibility and full XR runtime behavior remain design work. Sources: S07, E01, E02.

This is where Rosetta's external-anchor discipline is useful. A runtime-specific spatial anchor does not become a universal identity simply because it is persistent inside one application. A Concept can reference the external identifiers that matter to a task, while a Frame binds the relation being asserted. A later reassociation can be represented without silently altering every participant's history. [L04]

### 11.2 An AI participant needs a grounded working context

An AI inhabitant of a shared space needs more than a stream of rendered frames. It needs a way to distinguish current observations, remembered geometry, predicted motion, operator instructions, and permitted actions. A task-specific Tapestry can provide a bounded working set: the relevant objects, active scene, evidence, uncertainty, and tool affordances. The agent can query for more detail when needed rather than receive the entire venue state on every turn.

The agent's natural-language statements should remain connected to that context. “The case near the left truss” is a useful phrase if the reference resolves to the intended object and frame. If two cases fit the description, the system should preserve that ambiguity. If the agent uses a predicted location, the interface should not present it as a fresh observation. Grounding is a relationship between an expression and evidence, not a cosmetic label saying that an answer is grounded.

The agent can also propose an executable action or simulation. It might suggest repositioning a camera, preview the effect in a scene model, and request operator approval through an existing production interface. The simulation branch remains separate from the live scene. A successful preview is useful, but it does not grant permission to move the physical camera.

### 11.3 Shared space does not require identical perception

Participants will have different sensors and different access. A headset may localize against a map that a robot never sees. A remote participant may rely on a preloaded scene. An AI service may receive only a sparse semantic view. The architecture should support correspondence rather than demand identical internal representations.

A frame resolver can connect the views when a valid alignment exists. An association record can connect their object references. A projection contract can explain omitted appearance or uncertain geometry. If the alignment is unavailable, the consumer should receive a qualified or local-only view. Pretending that all participants share one perfect coordinate system would make the proposal easier to draw and harder to build.

The original studio discussion made this issue visible through see-through display hardware and externally supplied sensing. A display is not automatically a complete spatial tracking system. An IndraNet design can accommodate a modest display client while sourcing localization elsewhere. The general principle is to declare device capability and select an appropriate projection, not infer a full XR stack from the presence of glasses. [L06]

### 11.4 Accessibility is a first-class projection

Shared physical context could support more than visual overlays. A participant may request spoken descriptions, simplified geometry, high-contrast cues, spatial audio, or a reduced-distraction view. These are not merely alternative skins on a single video stream. They can be projections of entities, relationships, events, and process state.

For example, an assistant could announce that a requested object has entered an accessible pickup region, identify which instruction applies to the current machine, or describe a performer entering a scene. The system needs evidence and timing to make such descriptions useful. It also needs a way to distinguish a measured event from an inferred narrative. A descriptive interface should not turn uncertain state into confident language simply because text is easier to display than an uncertainty region.

This opens a collaboration surface for accessibility researchers and designers. They can evaluate what information a user actually needs, how uncertainty should be communicated, and which spatial representations improve a task. The architecture's value would be that the same underlying evidence can support several carefully designed experiences instead of requiring a separate sensing project for each one.

### 11.5 A first XR collaboration

A practical pilot can use one room, one physical object, two client views, and a documented identity/frame binding. One client displays a spatial overlay. The other asks a structured query about the object and receives its evidence chain. Moving the tag to a second object should require a new association. Revising the room alignment should update new views while preserving replay of the old one.

That pilot tests a useful boundary without requiring a photorealistic world or a fully autonomous agent. Its deliverables are the mapping, view contract, and interaction record. A headset vendor or application team can then decide whether to add richer tracking, persistent anchors, or rendering. The collaboration grows from an inspectable shared object rather than a demand to adopt a complete platform.

## 12. Warehouse automation and robotics

A warehouse is a strong application domain because physical state is already distributed across many operational systems. Fleet software knows robot tasks. Localization systems know positions. Machine controllers know equipment state. Inventory systems know intended asset identity and workflow. People know temporary conditions that may not appear in any map. An XR maintenance tool may need to connect all of these to the correct object at the correct time.

Existing systems already solve important parts of this problem. VDA 5050 defines an interface for mobile robots and fleet control. Open-RMF addresses interoperability among fleets and physical infrastructure. Industrial RTLS platforms combine location technologies and enterprise systems. IndraNet should work with these capabilities, not describe them as absent. Its proposed contribution is a shared semantic and evidential layer across the specific operational contexts that a deployment chooses to connect. [S09, S48, S52]

### 12.1 A mixed-traffic scene

Consider an aisle containing two mobile robots, a pallet, a human worker, a maintenance cart, and a temporary restricted zone. One robot localizes through its own perception stack. The other reports through a fleet interface. An RTLS system tracks the cart. A sensor reports that a machine is in maintenance mode. A supervisor creates a temporary zone because work is underway. These records differ in source, authority, time, and certainty.

The shared context should preserve those differences. The robot pose is an estimate in a map frame. The cart's tag association identifies which asset is being tracked. The restricted zone is an authorized operational declaration, not a sensor measurement. The machine mode is a source-system state with its own update semantics. The worker's location may be represented only as a coarse occupancy region, depending on the task and privacy policy.

![Keep warehouse disagreement visible. Values are from the synthetic warehouse story. The example preserves competing positions and a stale battery report; it does not control an AMR or certify safety. Sources: E02, S09, S52.](/research-assets/indranet/graphics/F12.svg)

**Figure F12. Keep warehouse disagreement visible.** Values are from the synthetic warehouse story. The example preserves competing positions and a stale battery report; it does not control an AMR or certify safety. Sources: E02, S09, S52.

A fleet advisory view can combine the relevant context without becoming the robot safety controller. It can tell a fleet manager that a temporary zone exists, which authority created it, and which observations indicate occupancy nearby. The fleet and robot retain their appropriate local control responsibilities. A maintenance view can attach the zone to a work order. An XR view can show the technician the region and procedure. An audit view can preserve the full history.

### 12.2 End-to-end handoff

The reference flow begins with a native robot-position message and a locating-provider message. Adapters preserve both payloads and expose their time and frame metadata. An association record links the locating identifier to the maintenance cart. A frame transform maps the relevant estimate into the warehouse map. A context record identifies the active maintenance task and the temporary zone revision.

A second observation conflicts with the first cart position. The context service does not average the records into a falsely precise point. It retains the alternatives and marks the view contested under the selected profile. A later correction supersedes one association. The current view changes, while a historical query still shows why an earlier advisory was generated.

The fleet projection emits an advisory artifact containing the relevant zone and quality status. The XR projection produces a technician-facing object and procedure reference. The audit projection exposes the source and revision chain. All are derived from the same evidence set, but each omits different information deliberately. No physical navigation command is sent by the reference demonstration.

### 12.3 Machine state and maintenance context

Location alone is often insufficient. A machine can be physically present but unavailable. A cart can be in the correct region but associated with the wrong work order. A robot can be localized but operating under a map revision that predates a temporary layout. IndraNet's proposed value is to connect these contextual conditions to the spatial view.

AAS is relevant here because it provides an asset-oriented information model and related interface specifications. SensorThings can contribute observations; NGSI-LD can contribute context relationships; a fleet interface can contribute task and status. The application can bind these artifacts to a maintenance Frame without demanding that any one standard absorb the others. [S01, S02, S09, S51]

A first implementation should choose a narrow maintenance scenario. It might connect one machine status, one asset association, one temporary zone, and one technician view. The output should show exactly which condition changed the advice. If a stale maintenance flag affects a view, the stale state should be visible. This is a better foundation for collaboration than a dashboard that appears comprehensive but hides its knowledge gaps.

### 12.4 Human awareness and cautious interpretation

The research corpus includes work on uncertainty-aware human-robot collaboration and on estimating human awareness from visual pose and head direction. These are relevant neighboring efforts, but they occupy different evidential roles. The awareness paper describes a pipeline evaluated with synthetic data; a viewing direction is not direct access to a person's intent. The uncertainty-oriented work illustrates why bounded prediction and explicit assumptions matter in human-robot settings. [S28, S32]

An IndraNet profile should therefore carry such outputs as interpretations or predictions, with model and evidence references. It should not convert them into an unqualified fact that a worker has noticed a robot. The operational system can decide whether and how to use the interpretation under its own validated policies. The shared layer can make that use auditable without pretending to settle the underlying human-state inference.

This approach also preserves useful research opportunities. A team can investigate whether richer context improves operator understanding or reduces unnecessary integration work before claiming a safety benefit. It can compare coarse occupancy, detailed pose, and task context for a particular application. The architecture gives these alternatives a common place to be represented without requiring a premature universal choice.

### 12.5 Toward a cross-vendor workcell

A credible joint demonstration could involve a localization provider, a fleet or facility integration team, and an XR or maintenance application. Each contributes a bounded interface. The shared deliverable is an agreed context profile with recorded source messages, explicit frame/identity mappings, and consumer outputs. The participants can then identify which agreements were reusable and which remained domain-specific.

The most interesting success would not be a claim that IndraNet controls the warehouse. It would be a demonstration that a new consumer can understand an existing physical event and its operational context without another round of undocumented interpretation. That is a practical form of interoperability: the right state, about the right entity, under the right conditions, available to the right participant.

## 13. Public-space safety without making identification the default

The original discussion extended IndraNet toward environments where a complete stadium-style infrastructure would be impractical: streets, festivals, campuses, transit interchanges, and other complex shared spaces. The useful premise is not that every person should become a persistent tracked identity. It is that operators may benefit from a common, privacy-minimized account of conditions, uncertainty, and possible incidents. [L01, L07]

A public-space application can begin with aggregate flow, occupancy, environmental sensors, equipment state, and human reports. A blocked route, unusual accumulation, lost communications link, or conflicting count can become a context event. The system can preserve the source and interpretation while keeping the public-facing projection much smaller than the underlying sensing data.

### 13.1 A situational layer, not a suspicion engine

A useful public-space model describes conditions that an operator can investigate. It should not convert ambiguous movement into confident judgments about a person's intent. A sudden change in crowd motion might indicate a performance beginning, a route opening, weather, confusion, or a hazard. The model should preserve plausible explanations rather than label one as fact merely because it is alarming.

This is an appropriate use of Conjecture semantics. An incident candidate can reference aggregate observations and retain several interpretations. An operator can add context or close the candidate. The resulting record explains what evidence existed and how the interpretation changed. The application can become more useful through better context without claiming access to hidden motives.

![Situational utility without default identity. Proposed privacy-minimized situational workflow. No anomaly-detection efficacy, anonymity or legal compliance is established by this diagram. Sources: L02, E02.](/research-assets/indranet/graphics/F13.svg)

**Figure F13. Situational utility without default identity.** Proposed privacy-minimized situational workflow. No anomaly-detection efficacy, anonymity or legal compliance is established by this diagram. Sources: L02, E02.

### 13.2 Minimize before sharing

Privacy is strongest when unnecessary information never reaches a downstream consumer. The supplied corpus's Guardian Mode direction emphasized minimal situational features and bounded incident evidence. Contemporary volumetric research reinforces a related point: sensitive visual content can leak through geometry or another camera view if filtering occurs only after fusion. InViStream, described in _Cloak of Invisibility_, investigates depth-aware, multi-view filtering before cloud-side reconstruction. Its relevance is architectural; it does not establish perfect redaction. [L07, S33]

An IndraNet deployment could therefore separate a local sensing plane, a minimal shared-state plane, and a restricted evidence-review plane. The shared plane might contain zone occupancy intervals, confidence or quality status, and operational events. Access to richer evidence would require a specific purpose and authority. Retention would be explicit. The public dashboard would not automatically inherit access to raw images or linkable trajectories.

This separation also helps collaboration. An operator can contribute an aggregate signal without giving every partner unrestricted access to its sensors. A research team can work with a synthetic or de-identified scenario. An accessibility service can receive a route obstruction description without receiving individual identities. The shared contract can make these boundaries machine-readable instead of leaving them as a note in a procurement document.

### 13.3 A bounded reference scenario

The reference scenario uses synthetic aggregate observations for several zones. One source reports increasing occupancy near an exit. Another reports that a nearby route is temporarily closed. A human report suggests that a scheduled performance has attracted a crowd. The context layer creates an incident candidate with multiple explanations and a request for operator review.

The public projection contains the affected zone and a coarse status. The operator projection contains the evidence references and the competing explanations. A researcher projection can receive the synthetic trace and the interpretation structure. No persistent person identity is needed. The demonstration is about information flow and accountable interpretation, not a deployed detection system.

The scenario also includes a correction. A route-closure report is withdrawn or expires. The active view changes, and the incident candidate is reconsidered. Earlier outputs remain explainable. This is the same revision mechanism used in the warehouse and performance cases, but the domain profile imposes different minimization and access rules.

### 13.4 Governance is part of the interface

A public-space deployment needs explicit responsibility for each class of data and action. Who can create a zone? Who can view incident evidence? Who can correct a report? Who can export a record? What happens when a source disappears or a policy changes? These questions cannot be settled by a generic confidence score.

The proposed architecture separates the representation of an authorization or decision from the mechanism that produced it. A public interface can show that a request was denied or that access was restricted under a named policy without disclosing every private operational rule. It should still provide enough information for an authorized reviewer to understand the decision and its scope.

This makes the Tripwire-style application a domain of accountable situational intelligence rather than a license for indiscriminate surveillance. The architecture can support careful local detection, corroboration, review, and limited sharing. Whether a particular deployment is lawful, socially acceptable, and useful requires domain-specific work. The prospectus's contribution is to make those responsibilities visible before the system is built.

### 13.5 Collaboration questions worth asking

A pilot could ask whether a minimal shared signal helps operators coordinate across a venue boundary. Another could ask which privacy-preserving representations retain enough information for accessible routing. A third could compare how people interpret an alert with and without visible alternatives and source age. These are useful questions for operators, privacy engineers, accessibility researchers, and HCI teams.

The architecture should make it inexpensive to explore them with synthetic and controlled data. It should not require a city-scale deployment to discover whether the interface is intelligible. Public-space applications have real stakes; the first collaboration should establish what information is necessary, who benefits from it, and how participants can challenge or correct its interpretation.

## 14. Transit, infrastructure, sports, and industrial continuity

The same shared-context pattern can extend beyond the six detailed reference scenarios. The original discussion named transit systems, sports, festivals, themed environments, manufacturing, and large public places as domains in which a common physical-state layer might become useful. These are prospective application settings, not claimed customers or deployment commitments. [L01]

The point of this breadth is not to pretend that one product can immediately serve every industry. It is to identify which architectural relationships repeat: identity across systems, spatial and temporal alignment, contextual interpretation, evidence lineage, process state, and selective consumer views. A new domain should reuse those relationships while defining its own vocabulary, responsibilities, and operational constraints.

### 14.1 Transit and facility interfaces

A transit interchange combines moving participants, fixed infrastructure, temporary conditions, schedules, maintenance work, and several administrative domains. A useful IndraNet view might connect a platform or corridor region to occupancy, an equipment status, an accessible route, and an active maintenance declaration. A passenger-facing application could receive a simple route update while an operator sees its source and uncertainty.

The architecture should not assume that a transport operator will expose all infrastructure data. A limited interface can still be useful. A building or station can publish a permitted region status with validity and authority. Another system can consume it without acquiring the right to control the infrastructure. An external robot or delivery service can request the relevant facility context through an existing coordination layer, with Open-RMF offering a neighboring example of multi-fleet and building-infrastructure interoperability. [S52]

A first prototype might involve one route segment and one equipment state. It could show how an accessibility projection changes when the segment becomes unavailable, how an operator corrects the record, and how an old client detects that its view is stale. The useful result is an interface agreement, not a claim to have solved urban mobility.

### 14.2 Industrial lifecycle

An industrial asset changes through design, commissioning, operation, maintenance, and retirement. Its geometry, identifiers, documentation, sensor relationships, and operating context may live in different systems. AAS and digital-twin platforms already address important lifecycle needs. IndraNet can explore how live spatial evidence and Rosetta interpretation/process semantics connect to those existing asset structures. [S51]

For example, a technician wearing XR equipment might inspect a valve or tool. The application needs the correct physical association, the applicable asset record, the current procedure, and the evidence that a step was completed. A later audit needs to know which revision of the procedure and object association was used. A simulation team might need the same asset's geometric and operating-state references without receiving the technician's personal data.

This is a continuity problem across representations. The proposed shared layer can bind the relevant artifacts while leaving engineering models, maintenance systems, and operational control under their existing owners. A prototype could demonstrate a single maintenance handoff and its replay before attempting broad lifecycle integration.

### 14.3 Sports and live events

Sports combine motion, rules, roles, timing, media, and audience experience. A tracking feed can support many uses: production graphics, replay, athlete analysis, spectator accessibility, and an immersive remote view. These uses should not automatically receive the same data or make the same evidential claims.

An IndraNet sports profile could distinguish official event records, measured tracks, inferred interactions, predicted trajectories, and creative reconstructions. A remote viewer might choose a spatial perspective while the interface preserves which regions are reconstructed from current evidence and which are generated. A production team could attach camera and lighting context to the same event history. A researcher could receive a permitted subset for model development.

The first useful demonstration would be small: a recorded movement sequence, an event annotation, and two projections with different purposes. The broader ambition is to let event meaning travel across production and interactive experiences without requiring every consumer to reverse-engineer the same timing and identity relationships.

### 14.4 Temporary environments

Festivals, touring productions, exhibitions, and temporary work sites are especially interesting because their context is assembled, changed, and removed. A preloaded world package may need to be calibrated to the actual site. Equipment associations change. Network availability varies. A participant may join late with an incomplete cache. The shared layer needs an explicit lifecycle for the place itself.

A deployment package could describe the intended geometry, zones, device roles, profiles, and rights. Commissioning observations would establish which parts match the actual setup. A revision could record a moved barrier or replacement fixture. Consumer views would bind to the current package revision rather than assume that yesterday's layout remains valid.

This is a bridge between digital planning and live operation. It also connects naturally to Generative Reality: a receiver can preload much of the intended environment while still requiring fresh evidence for what changed. The architecture becomes more useful when it treats the plan, the observed setup, and the current interpretation as distinct but related objects.

### 14.5 Reuse without pretending away domain differences

Cross-domain reuse should be selective. A performance scene and a maintenance procedure both need context and process trace, but they do not share the same admission policy. An audience projection and a fleet advisory both need freshness, but their acceptable degradation differs. A sport replay and an incident review both use recorded evidence, but their rendering and retention contracts may be very different.

IndraNet should therefore grow through domain profiles that share a semantic spine, not through a universal application schema with hundreds of optional fields. A new profile should identify the common objects it reuses, the specialist standard it anchors, and the additional relationships it introduces. That makes the expanding application portfolio legible without making the Core expand at the same rate.

## 15. From spatial memory to executable worlds

A spatial memory describes what a system has represented about a place. An executable world adds a model of how some part of that place could evolve. The distinction changes the kinds of questions an application can ask. It can move from “where is the object?” to “what would happen under this action or assumption?” IndraNet's proposed role is to connect those models to evidence, context, and consumers while preserving the difference between observation and explanation.

The source corpus already contains several stages of this transition. Persistent scene-graph and mapping work organizes entities and relations over time. Physical-reasoning systems construct executable descriptions from observations. World-model systems predict future visual or geometric state. State-centric generative systems separate explicit dynamics from appearance. These are different contributions to an executable-world stack, not one interchangeable class of model. [S14–S38]

### 15.1 Persistent memory as a reusable source

A map that survives beyond one frame can supply context to several tasks. It can record that an object was observed, where it was associated with the environment, and which relationships were inferred. Research such as DGSG-Mind, FUS3DMaps, OVI-MAP, and DSG offers different approaches to constructing or updating such representations. The prospectus does not prescribe one winner. It proposes an interface at which their outputs can remain identifiable and revisioned. [S18, S19, S26, S30]

That interface should preserve the source model, geometry representation, association method, and time. It should not require every map to be reduced to one simplistic object list. A consumer may use a graph projection while retaining a reference to the richer native map. If the projection omits uncertainty, topology, or appearance, that loss should be declared.

A useful first integration could take a recorded scene-graph export and connect one object to an asset record and an XR view. A later integration could attach changes from a live mapping system. The architecture grows by adding evidence and consumers, not by declaring a complete world model before it has a concrete source.

### 15.2 Executable conjectures

Code-as-World and PhysMind are relevant because they make physical explanations executable. The former describes agentic discovery of physical representations through simulation and verification. The latter describes deriving executable dynamics from video for physical reasoning. The current Code-as-World repository exposes inference/evaluation recipes and a ballistic simulation example; this is a usable implementation surface, but not a reason to assume every component of the paper is released or integrated here. [S14–S16]

Rosetta can represent an executable model as a candidate explanation tied to evidence. A Frame identifies the modeled subjects and assumptions. A Conjecture identifies alternatives. A process trace records the simulation invocation. Predicted observations remain separate from received sensor observations. An Evaluation records a comparison under a named procedure. A refinement creates a new candidate rather than mutating the old one. [L04, L08]

![Executable worlds are participants. Research-facing exchange proposal. The code uses labeled reference envelopes, not the cited upstream world-model runtimes. Sources: S14, S16, S36, L12.](/research-assets/indranet/graphics/F14.svg)

**Figure F14. Executable worlds are participants.** Research-facing exchange proposal. The code uses labeled reference envelopes, not the cited upstream world-model runtimes. Sources: S14, S16, S36, L12.

This structure gives a powerful model a bounded place in the system. It can propose mechanisms, generate predictions, and support reasoning without becoming the source of truth for the entire place. A renderer can use a candidate trajectory for a preview while a robot continues to use its own current observations for local control. An operator can inspect the model's assumptions before relying on its output.

### 15.3 A physical event with several explanations

Consider a small object moving across a surface. A camera supplies a track. One model explains the motion as a simple ballistic or rolling process. Another includes contact with an unseen constraint. Both may fit part of the visible sequence. A third model may be useful for prediction but use a different internal representation.

IndraNet should preserve these candidates and their relationships. It can record which segment of evidence each used, which simulator and configuration were invoked, and which comparison produced a result. It can also record that a candidate is outside its applicability when the object deforms or the environment changes. The goal is not to force the system to certify a unique cause. It is to make the alternatives usable in a larger application.

A production designer could use one candidate for an effect preview. A research team could compare model behavior. An educational application could let a learner change an assumption and see the predicted consequence. An audit view could show the original observations and all candidate branches. These are different uses of the same executable hypothesis graph.

![Several futures, one preserved history. Conceptual epistemic branch graph. Prediction, simulation, counterfactual and measured history remain separate. Sources: S14, S38, S53, E02.](/research-assets/indranet/graphics/F15.svg)

**Figure F15. Several futures, one preserved history.** Conceptual epistemic branch graph. Prediction, simulation, counterfactual and measured history remain separate. Sources: S14, S38, S53, E02.

### 15.4 Prediction, simulation, and counterfactuals

A prediction concerns a future or unobserved state under a model. A simulation is an execution of a model. A counterfactual branch changes a specified condition relative to an actual or reference history. These can overlap, but they should not be represented as ordinary observed state without qualification.

CG-World's reported organization of state, observations, events, and branch lineage is a close neighboring contribution. It shows that the source landscape already recognizes the importance of explicit intervention and branch metadata. IndraNet can seek compatibility with such structures rather than invent a competing vocabulary for every branch relationship. [S38]

A candidate profile can identify the branch origin, changed assumptions, invariant conditions, model configuration, and output artifacts. A consumer can then ask whether it is viewing a historical replay, a forecast, or an alternative scenario. That distinction is essential for both physical reasoning and generative media. The same visual sequence can be useful entertainment, a planning preview, or a misleading record depending on how its origin is represented.

### 15.5 World models as interchangeable participants

The long-term architecture should not depend on a single world-model family. A model can declare the inputs it accepts, the state it produces, its supported domain, and the evidence needed to interpret its outputs. A wrapper can preserve its native artifacts and expose a shared projection. Another model can participate through a different representation if the mapping is explicit.

HoloAgent-0, MVISTA-4D, and RynnWorld-4D illustrate different relationships among spatial memory, future representations, and action. Marionette and Programmable World Model illustrate explicit state evolution coupled to generated appearance. StateFlow illustrates persistent editable state for previsualization. These sources motivate several integration surfaces rather than one standardized internal model. [S20, S22, S31, S35–S37]

A useful collaboration would identify one artifact boundary: a scene snapshot, a candidate dynamics program, a predicted trajectory, or a rendered observation. The teams could agree on evidence and context metadata around that artifact while leaving their internal model architecture unchanged. This would let an IndraNet application compare, compose, or substitute specialist participants without pretending that their outputs are equivalent merely because they share a file extension.

### 15.6 The prototype should expose the question

The executable-world reference in this package uses deliberately simple models and synthetic observations. Its purpose is to demonstrate the graph: evidence, candidate explanations, simulated trajectories, comparisons, and retained alternatives. It does not claim to reproduce the cited research systems. Their integration packages remain explicit reference boundaries until real artifacts and runtimes are connected.

This is still useful machinery. A researcher can replace a synthetic candidate with a released model's output. A simulator team can replace the simple trajectory generator. A consumer can inspect the same graph without depending on either implementation. The prototype turns a broad idea into a concrete place for collaboration, which is the appropriate contribution of this prospectus.

### 15.7 The September frontier strengthens the exchange question

Three recent research directions sharpen the case for a small common contract without implying that their internal representations should be merged. PileBelief separates updates from completed physical interactions from a distinct imagined state advanced by hypothetical actions. Object-path graphs connect open-vocabulary semantic grounding to topological navigation without requiring dense metric reconstruction. Astronex-World 1.0 exposes camera, action, embodiment and time-positioned event conditioning for generated video. Each contributes a different kind of state. [S53, S54, S55]

An IndraNet participant should be able to tell those products apart. An interaction-updated physical belief is not a fresh sensor measurement. A topological path relation need not pretend to be a complete metric scene. A video predicted under an action sequence is not a witnessed future. Preserving those distinctions enables composition: a navigation consumer may use a path graph, a physics service may consume measured interaction history, and an XR renderer may use a generated appearance stream, all with explicit links to their inputs.

The opportunity is not that these papers prove IndraNet. It is that their interfaces increasingly expose the kinds of objects a shared context layer could exchange. The seven research-reference packages in the implementation make that proposal concrete through source-anchored envelope examples, declared assumptions and prohibited promotions. They execute local representation checks; none invokes the cited model or claims partnership with its authors. [E01]

A useful collaboration would replace one reference envelope with an upstream-produced artifact, document what is preserved or lost, and run a consumer written by a different team. That is a tractable research contribution in its own right. It also lets the best world-model, sensing and rendering systems evolve independently rather than forcing the entire ecosystem to adopt one internal state representation.

## 16. Generative Reality: prior, state, and witness

Generative Reality is the most ambitious branch of the IndraNet proposition. Instead of assuming that remote presence must transmit a complete volumetric reconstruction continuously, it asks whether a receiver can begin with a prepared world package, follow a dynamic state stream, and obtain fresh appearance evidence only where the prepared knowledge is insufficient. The proposal is not to replace reality with a convincing hallucination. It is to separate what can be shared in advance, what changes during an event, and what must be witnessed anew. [L01]

This architecture has three distinct objects. The **prior** is a versioned package of scene assets, geometry, materials, appearance models, rules, and decoder requirements. The **state** is a stream of selected changes and relationships. The **witness** is fresh evidence for details that the prior and state cannot faithfully determine. A receiver combines them under a declared rendering contract.

![Generative Reality: prior, state, witness. Conceptual Generative Reality architecture. No neural decoder or communication-saving benchmark was executed. All three input strata contribute to total cost. Sources: S34, S35, S36, S39, S40, S41.](/research-assets/indranet/graphics/F16.svg)

**Figure F16. Generative Reality: prior, state, witness.** Conceptual Generative Reality architecture. No neural decoder or communication-saving benchmark was executed. All three input strata contribute to total cost. Sources: S34, S35, S36, S39, S40, S41.

### 16.1 Why this is more than conventional video compression

Conventional video remains an important baseline and a likely component of the system. Generative Reality proposes a broader split in responsibilities. A world package can contain a reusable venue, known objects, a production rig, or participant-approved appearance assets. State updates can describe motion, events, camera choices, lighting conditions, and changes in object relationships. Witnesses can refresh appearance or document unexpected details. Different consumers can request different combinations.

A robot might consume state without appearance. An XR technician might consume geometry and evidence labels. A remote attendee might consume a rich reconstruction. An archival viewer might require evidence-faithful rendering. An accessibility client might receive structured events and spatial audio cues. These products are not all video codecs, even if some rely on compressed video for their witness channel.

The architecture therefore creates a potential meeting point among scene-description, graphics, sensing, networking, and semantic systems. OpenUSD can contribute scene assets and composition. Neural texture compression can contribute efficient material representation. Free-viewpoint techniques can contribute appearance updates. Conditional video generation can contribute receiver-side synthesis. Rosetta and IndraNet can bind these objects to evidence, identity, context, and use. [S06, S39–S42]

### 16.2 What the current research makes plausible

NVIDIA's neural texture-compression work is relevant to pre-positioned appearance because it addresses compact material representation with random-access reconstruction. QUEEN is relevant to incremental free-viewpoint representation through quantized Gaussian attributes and residual changes. Neither by itself establishes an end-to-end live IndraNet transport. Their value here is as specialized components whose interfaces might be composed. [S41, S42]

Lyra 2.0 is relevant to persistent generative worlds and geometry-guided memory. Marionette separates predicted articulated world state, geometric rendering, and appearance synthesis. Programmable World Model separates program-driven state evolution from visual generation. StateFlow maintains an editable 3D working state for previsualization. Together, these sources make the state/appearance boundary a concrete research direction rather than an unsupported metaphor. [S34–S37]

Semantic-conditioned video work supplies another part of the picture. DiSCo uses semantic and degraded-video conditioning for reconstruction, while the causal-diffusion video paper studies reconstruction from compact representations with temporally causal inference. In that title, “causal” concerns temporal access in the model, not proof of physical causality. These systems motivate a witness and conditioning channel; they do not establish that arbitrary live events can be reconstructed from a few symbolic coordinates. [S39, S40]

The proposed synthesis is consequently specific. Use structured state to maintain the aspects of the world that can be represented explicitly. Use prepared assets and learned priors to render reusable appearance. Use witnesses to anchor novelty and evidence-sensitive detail. Give the receiver a contract defining when synthesis is acceptable and when missing evidence must remain visible.

### 16.3 A world package before the event

A prepared package can include venue geometry, object assets, material representations, coordinate conventions, known device roles, scene profiles, and a set of permitted rendering modes. It can also include models or decoder components when licensing, device capability, and distribution allow. The package should identify every material dependency by version or digest rather than rely on a vague statement that the receiver has “the same scene.”

For a performance, the package might contain the room, stage rig, instrument models, approved performer assets, and expected scene vocabulary. For a factory training session, it might contain the equipment geometry, procedure context, and allowed overlays. For a temporary event, it might contain the planned layout and a commissioning record that distinguishes intended geometry from observed setup.

The package is not a frozen claim that the world will remain unchanged. It is a shared starting point. A receiver can declare which assets it has and which representations it can decode. A late-joining client can request a current snapshot and the missing dependencies. A low-power client can select a simpler projection. A cache eviction can become an explicit asset miss rather than a silent rendering error.

### 16.4 State as a controlled stream of change

The state channel should carry the aspects of the event that the application has chosen to represent explicitly. It can include pose changes, object associations, contact events, scene transitions, lighting state, audio-source positions, and process events. Some state may be measured; some may be inferred or predicted. The evidential role must remain available to the receiver.

A state update should identify its base revision or sequence, its valid time, and the dependencies needed to interpret it. If the receiver misses an update, it needs a recovery path. If an association changes, subsequent poses must not continue to move the wrong entity. If the scene's coordinate alignment changes, the update should identify the transform revision rather than appear as sudden physical motion.

The state channel can also carry a derivation rule or a change to one. A carried object may follow a parent transform while an attachment remains valid. A door's geometry may be derived from a hinge model and an angle. A light's aim may be derived from a target association. These relationships can reduce repeated state, but only when the receiver knows the rule and its applicability. They do not justify omitting exceptions.

### 16.5 The witness channel

A witness supplies fresh evidence that the shared prior does not contain. An unfamiliar shirt graphic, an unexpected object, a changed surface, a facial expression, a damaged component, or a novel interaction may require new visual or geometric information. A sparse state description cannot determine arbitrary details that it never encoded.

Witnesses can take several forms: a bounded image region, a short video segment, a texture residual, a depth patch, a point-cloud update, or a native capture artifact. The interface should identify the source, capture interval, spatial or object coverage, rights, and relation to the state it supports. A witness is not useful merely because its bytes arrive; the receiver must know which part of the reconstruction it can justify.

![A prior cannot know an unexpected sign. Illustrative information boundary. A plausible generated sign is not evidence of the sign that occurred. Rendering modes must preserve that distinction. Sources: S39, S40, E03.](/research-assets/indranet/graphics/F17.svg)

**Figure F17. A prior cannot know an unexpected sign.** Illustrative information boundary. A plausible generated sign is not evidence of the sign that occurred. Rendering modes must preserve that distinction. Sources: S39, S40, E03.

Consider the unexpected shirt graphic. A prepared performer asset can reproduce general appearance, but it cannot know the new graphic. In an evidence-faithful mode, the receiver should use a current witness or mark the detail unresolved. In a perceptually reconstructed mode, it may use a plausible approximation if the contract permits and labels it. In a creative mode, it may intentionally replace the costume. The same system can support all three, provided it does not confuse their outputs.

This witness concept is also important for privacy. A receiver should not obtain an unrestricted raw feed merely because one region needs updating. A source-side filter can produce a permitted witness with limited coverage. The architecture can preserve the relationship to its source and transformation without making every private pixel available to every participant. InViStream's multi-view privacy work provides a relevant neighboring design concern. [S33]

### 16.6 Three rendering contracts

The **evidence-faithful** contract prioritizes what the available evidence can support. Unknown or stale regions remain visibly unknown, simplified, or unavailable. A model may assist reconstruction, but it must not introduce an unmarked detail that the contract treats as evidence. This mode is appropriate for tasks in which appearance has evidential significance.

The **perceptually reconstructed** contract prioritizes a coherent experience while retaining provenance and a clear account of generated or interpolated content. It may use plausible appearance between witnesses, under a declared quality and evidence policy. This mode could support entertainment or remote presence where exact pixel fidelity is not the only objective. Its interface should still make important evidence gaps available to the user.

The **creative** contract allows deliberate transformations: stylized environments, altered costumes, virtual effects, or fictional extensions. It is not a lower-quality evidence mode. It is a different purpose. The output should remain associated with the creative contract so that a later screenshot or recording is not silently mistaken for an unmodified capture.

These contracts let the architecture support imagination without weakening evidential clarity. A remote performance can become visually extraordinary while an operator's diagnostic view remains grounded in current source state. The same semantic history can support both because the projection makes its purpose explicit.

### 16.7 Receiver negotiation

A receiver needs to communicate more than screen resolution. It can declare supported scene formats, decoder capabilities, available assets, local compute constraints, desired viewpoint, permitted data classes, and selected rendering contract. The producer or gateway can then construct an appropriate projection. This is a proposed negotiation layer, not a claim that current XR runtimes already implement it.

A practical exchange could begin with a manifest request. The receiver identifies cached assets and compatible profiles. The gateway provides a current state snapshot, required dependencies, and a witness policy. The receiver acknowledges a coherent baseline before consuming incremental updates. If a dependency changes, it can request repair or select a reduced representation.

This process is especially important for heterogeneous devices. A desktop renderer, standalone headset, phone, and audio-only client should not be forced to consume identical payloads. The semantic contract can remain stable while the representation and rendering strategy vary. The architecture's benefit is the ability to make those variations explicit and testable.

### 16.8 Remote embodiment and participation

Remote attendance can become more than passive viewing when the system represents participants and their permitted actions. A remote attendee might choose a viewpoint, enter a virtual collaboration area, or interact with an approved object. An AI participant might answer questions about the current scene or assist with a task. A robot might contribute observations from another location. Each interaction should identify whether it affects a local presentation, a shared virtual state, or a physical system.

The distinction prevents a remote gesture from accidentally acquiring physical authority. A creative effect in a participant's own view is different from a request to change venue lighting. A simulation branch is different from the live scene. A remote operator's request is different from a spectator interaction. Rosetta's process and policy relationships can keep these roles explicit while IndraNet supplies the spatial context.

A first participation prototype might allow two clients to refer to the same object and propose different views without changing the physical scene. A later collaboration could connect a supervised physical interaction through an existing controller. The architecture provides a path from shared reference to shared action, but it does not erase the need for authority at each step.

### 16.9 A prototype that teaches the architecture

The present reference implementation does not generate a photorealistic performance. It implements the manifest, state, witness, and rendering-contract logic around a small synthetic scene. A receiver can have a cached world package, receive a state change, discover a missing witness, and produce a mode-specific render plan. A dependency change can invalidate an earlier derived view. These behaviors are useful before a neural renderer is attached.

A graphics partner can replace the simple render-plan consumer with a real renderer. A capture partner can supply witnesses. A networking team can evaluate recovery and scheduling. A research team can study which semantic state is sufficient for a chosen reconstruction task. The prototype gives each participant an interface at which to contribute without claiming the full system is already solved.

The central question is therefore constructive: what can be prepared, what can be derived, and what must be observed again? Answering it for one concrete event could produce a valuable architecture even if the eventual bandwidth, quality, or compute tradeoffs differ from the original intuition.

## 17. Semantic derivability, transport, and the economics of detail

The most distinctive compression idea in the original discussion was not simply “send fewer coordinates.” It was that shared meaning could make some state derivable. If two systems agree that an object is attached to another object under a known transform, they need not transmit every dependent coordinate independently. If they agree on a scene rule, they can derive its expected consequence until an exception occurs. The savings, if any, come from a valid shared dependency, not from a claim that semantics can conjure arbitrary missing information. [L01]

### 17.1 Derivation has a contract

A derivation rule identifies its inputs, output, applicability, version, and evidence status. An attachment rule can name the parent entity, local transform, and interval in which the attachment is believed to hold. A door model can name its hinge frame and angle. A production rule can name the scene and target relation. The receiver should know whether the rule is measured, configured, inferred, or hypothetical.

If the rule changes, dependent state becomes stale. If an object detaches, the child should not continue to follow the parent merely because no new position arrived. If a calibration changes, derived coordinates should be recomputed under the new revision. If the source of a rule is retracted, the receiver should be able to identify the affected views.

![Derive only under a declared dependency. Conceptual derivability and transport contract. The package supplies a prospective accounting harness, not measured bitrate or compute savings. Sources: S39, S40, S41, E03.](/research-assets/indranet/graphics/F18.svg)

**Figure F18. Derive only under a declared dependency.** Conceptual derivability and transport contract. The package supplies a prospective accounting harness, not measured bitrate or compute savings. Sources: S39, S40, S41, E03.

This is a graph problem as much as a codec problem. The system needs to track dependencies and invalidation. Rosetta's content-addressed artifacts and lineage provide a way to identify the rule and its inputs. IndraNet's domain profile can specify the physical interpretation and projection behavior. The reference prototype implements a bounded derivation graph to demonstrate how a changed dependency invalidates a previously acceptable view.

### 17.2 A total-cost model

A useful evaluation must count more than the live state payload. Total delivery includes the initial world package, state updates, witnesses, metadata, repair traffic, and any repeated transfers caused by cache misses. Receiver compute, energy, storage, and latency also matter. A system that reduces network traffic by requiring impractical local computation has moved the cost rather than necessarily reduced it.

A simple accounting expression is:

`B_total = B_bootstrap + B_state + B_witness + B_metadata + B_repair`.

This is an accounting identity for the proposed architecture, not a measured performance result. The terms depend on the session, device, viewpoint, cache state, and required fidelity. A warm receiver that already has a venue package is a different case from a first-time mobile attendee. A fixed-view reconstruction is a different case from free viewpoint. A creative rendering contract is a different case from an evidence-faithful one.

For a purely illustrative state budget, 120 entities updated 30 times per second with 40 bytes per update would produce 144,000 bytes per second before framing, metadata, transport overhead, witnesses, and repair. That is 1.152 megabits per second using eight bits per byte. The arithmetic does not claim that 40 bytes can express every required state, that 30 updates are sufficient, or that the resulting experience outperforms a video baseline. Its purpose is to make the design variables concrete.

### 17.3 Detail should follow the task

Different tasks need different detail. A fleet advisory may need a conservative occupied region and its age, not a textured body mesh. A stage effect may need a gesture event and target association, not a high-resolution scene scan. An XR maintenance application may need exact object identity and procedure context, while a remote attendee may care more about appearance and timing.

This suggests a task-relative notion of sufficiency. A projection can declare the information it needs and the errors it can tolerate. A sender can then choose among native state, derived state, compressed appearance, and fresh witnesses. The choice should remain visible in the projection contract. A consumer should not inherit an optimization that changes the meaning of its input without being told.

The idea also connects to Rosetta Tapestries. An agent's working context can contain the small set of relevant artifacts and evidence references rather than every source byte. That is a semantic context-selection problem. It should remain distinct from a media codec's rate-distortion problem, even when both reduce the amount of information delivered to a consumer. [L04]

### 17.4 Failure and recovery are part of the proposed codec boundary

A receiver can miss an update, lose an asset, or use a different model version. A witness can arrive late. A source may disappear. A scene may change faster than the receiver can reconstruct it. The architecture needs explicit degraded states: missing baseline, unresolved dependency, stale state, missing witness, incompatible decoder, and unavailable rights.

A sensible receiver does not silently combine incompatible revisions. It either obtains a coherent baseline, requests a repair, or selects a reduced representation that its contract permits. An evidence-faithful view may become a wireframe with unknown regions. A creative view may continue with labeled synthesis. An operator view may stop issuing advice until the relevant context is current.

The important property is that degradation remains meaningful. A black screen and a plausible but unsupported reconstruction are not the only choices. The system can expose what it still knows, what it no longer knows, and which evidence would restore the desired view. That is a practical contribution of combining semantic context with media transport.

### 17.5 The eventual empirical program

The later research program should evaluate the architecture under concrete tasks and devices. It should compare cold and warm starts, fixed and free viewpoints, predictable and novel scenes, available and missing witnesses, and several rendering contracts. It should report total delivery and receiver costs rather than celebrate one favorable payload term.

Human evaluation should distinguish visual appeal, task usefulness, and evidence faithfulness. A reconstruction can be beautiful and misleading, or visually modest and operationally useful. A bandwidth gain in one regime does not establish a universal advantage. These are important research questions, but they do not prevent the current prospectus from specifying the objects, interfaces, and demonstrations that would make the questions answerable.

The constructive conclusion is that semantic derivability belongs on the design map. It offers a plausible way to exploit shared structure across state, assets, and processes. The next step is to make the dependencies explicit enough that a collaborator can implement one branch and discover its actual tradeoffs.

## 18. From architecture to a candidate implementation

A prospectus becomes more useful when its vocabulary has executable consequences. The accompanying reference is therefore organized around the boundary between receiving a record and deciding what a consumer may infer from it. It does not try to reproduce every sensor, renderer, robot middleware stack, or world model discussed in this publication. It provides a small environment in which their proposed relationships can be inspected.

### 18.1 The implementation unit is a context-bearing exchange

The minimum useful exchange consists of more than a pose. It includes an immutable received signal, a parsed representation, a domain assertion, the context in which the assertion is useful, and a projection for a named consumer. Those objects are linked rather than compressed into one mutable row. A process may consume them, but a state observation alone does not authorize that process to act.

Consider a warehouse location report. The input adapter preserves the received message. A domain record associates its reported position with an external robot identifier and the relevant map. An association record connects that identifier to the local physical-entity handle. A context selection includes the current zone definition and the evidence available at a specified knowledge time. A consumer projection can then expose a location, its age, competing reports, and relevant restrictions. This is the beginning of a shared-context service, even before it controls anything.

The proposed implementation divides these responsibilities into independently inspectable modules. A store manages immutable records and revisions. A frame module handles bounded transforms. A view module applies purpose and freshness rules. A process module binds a proposed effect to the context that produced it. A reality module describes the receiver's baseline, state dependencies, witnesses, and rendering mode. A Rosetta projection carries the same chain into Core-compatible and namespaced domain artifacts.

These are architectural boundaries rather than prescriptions for one programming language. A production deployment may implement them with existing brokers, databases, graph stores, and policy engines. The reference uses local deterministic machinery because it makes the contract visible. Replacing its storage backend should not change the meaning of an Observation, a conflicting assertion, or an expired context.

### 18.2 What belongs in the candidate Pack

The candidate Pack should export spatial and executable-world specializations, not a second universal ontology. Its domain objects include frame bindings, state assertions, association records, consumer contracts, world-package manifests, witness references, and process bindings. Core concepts such as Observation, Conjecture, Evaluation, Run, Action, and Receipt retain their Rosetta meaning. [L04]

Schemas describe the exchange surface. Vocabulary files define the terms that would otherwise become undocumented strings. Profiles bind a subset of those terms to an actual use case. Translators record which native fields survive, which need contextual interpretation, and which are not supported. Examples demonstrate the relationship among artifacts. Negative fixtures show what should be rejected: a changed content digest, a missing evidence parent, an unauthorized projection, an incompatible frame, or a simulation mislabeled as a measurement.

The difference between a schema and a profile matters. A schema can require a timestamp-shaped string. A profile must explain whether that string denotes event time, receipt time, or the validity of a transform. A schema can require an uncertainty object. A profile must distinguish covariance, a vendor's accuracy estimate, a model score, and an unknown error distribution. The Pack needs both structural rules and semantic guidance.

A candidate Pack is also a collaboration device. A tracking vendor can inspect the ingress contract without accepting the proposed Generative Reality design. A renderer team can implement the receiver contract without adopting a particular localization engine. A world-model researcher can produce a Conjecture-linked result while keeping its inference method private. That modularity is part of the intended value.

### 18.3 Six executable stories

The reference examples follow the publication's central application families. The performance story binds the same gesture to two scene contexts and produces different control previews. The XR story exposes one object through different rights-scoped views. The warehouse story retains conflicting and stale location reports rather than silently selecting a winner. The public-space story uses synthetic aggregate observations and a human-review path. The executable-world story keeps alternative dynamics and their predicted outcomes separate from the source evidence. The remote-presence story checks whether a receiver has the baseline and witnesses required by its rendering contract.

These stories are deliberately small enough to read. Their purpose is to make the proposed semantics concrete and to give a future implementer a starting point for a real integration. They are not substitutes for the systems they represent. A synthetic location fixture is not a certified omlox exchange. A generated control packet is not a successfully controlled light. An analytic motion example is not a run of a cited world model.

The implementation manifest records these maturity distinctions per surface. That matters more than a single label for the whole repository. A project can have an executed local record store, a tested schema, a reference-only partner adapter, and a prospective media decoder at the same time. Treating all of them as equally complete would make the blueprint less useful.

### 18.4 The previous implementation remains an asset

The earlier package supplied a substantial collection of native-format mappings, finite fixtures, a candidate Rosetta projection, and reproducibility material. Those bytes are preserved as a versioned predecessor rather than silently rewritten. Its standards-composition result informs the new architecture by encouraging reuse of existing carriers. [L09]

The new work adds the context and process layer that the earlier editorial framing underdeveloped. It asks what a record means to a consumer, how revisions alter dependent outputs, how disagreement remains visible, and how a receiver chooses among evidence and synthesis. That is a constructive extension of the earlier engineering, not a repudiation of it.

The eventual production path should replace reference adapters one at a time. A vendor-supplied recording can replace one synthetic ingress. A native broker can replace the local transport. A real renderer can consume a world-package manifest. A second implementation can independently interpret a withheld example. Each replacement gives a collaborator a bounded job and preserves the larger composition.

### 18.5 What this revision actually runs

The current package contains 24 candidate schemas and 78 hashed Pack files, excluding the Pack manifest itself. Its 120 unit tests pass in the recorded local run. The six contextual stories generate 59 Tiles. A second set of three 90-second synthetic timelines generates 270 native records covering a performance dropout, provider/calibration changes, conflicting reports, rights restrictions, revision and counterfactual branches. Both declared selected-field profiles recover every native record exactly. The resulting 540 round trips establish internal codec consistency over these fixtures, not comparative compression, latency, safety or deployed interoperability. [E01]

The most useful repairs were small and consequential. Input now rejects duplicate JSON keys, nonfinite numbers and unpaired Unicode surrogates instead of allowing ambiguous or unencodable records into content addressing. Purpose checks follow the evidence ancestry rather than inspecting only a derived record's local label. A generated record cannot acquire a measurement role merely by passing through the optional bridge. These are executable versions of the paper's central distinction: a convenient projection must not gain more evidential or usage authority than its source. [E01]

The Pack validator checks manifest structure and identity, candidate payloads, replay stability and the implemented RDF constraint subset. A separate JavaScript constructor probe checks the generated Tile bodies and fixture signature against the recorded public constructor convention. It is an independent check of that subset, not a native Rosetta repository build. Full SHACL-engine validation and official upstream conformance remain separate tasks. The candidate has no assigned ROCK number. [E01, L12]

The preserved predecessor also reruns 18 integration examples covering the required external families, including OpenUSD preview text, OpenXR consumer views, a ROS transform subset, VDA visualization, OSC packets, and an explicitly simulated AAS boundary. These are local reference outputs. Its separate 13-schema, 89-record validator passes after excluding interpreter caches from the immutable Pack byte set. Keeping the predecessor intact avoids disguising legacy mappings as newly verified external integrations. [E04]

### 18.6 A worked exchange sourced from the executable artifacts

The performance example is the final Rosetta-unified demonstration because it connects the original artistic motivation to the full evidence-and-process chain. The source is the generated `Implementation/outputs/performance.json`, not a manually invented diagram. It contains 24 Tiles. The same gesture is interpreted under two scene contexts; the resulting control previews differ because context, not merely geometry, determines the requested effect. Received input, contextual interpretation, proposed process, admission result and output preview remain distinct. [E02]

The generated sequence is specific: `light-sculpture` maps the shared gesture to `/indranet/demo/light/level` with value 80; `sound-sculpture` maps the same gesture to `/indranet/demo/sound/send` with value 35. Reusing the old preview after the context switch returns `refused` with reason `context-changed`. Both outputs record `sent: false` and `actuationAuthority: false`. These are fixture values and fixed fixture times, not a live performance measurement. [E02]

The warehouse example supplies the complementary negative case. Its 11 Tiles retain competing reports and expose why a requested view is stale or restricted rather than hiding the condition behind a single preferred pose. The executable-world example supplies the epistemic case: 11 Tiles preserve alternative dynamics, predictions and evaluations beside the source evidence. The generative example supplies the receiver case: four Tiles bind a baseline, state dependencies, witness requirements and rendering contract without running a neural decoder. [E02]

The technical supplement prints the exact generated object identifiers, parent links and output fields for these examples, with a source-file digest for each. Re-running the documented command regenerates those artifacts before the supplement is checked. A collaborator can therefore begin at the manuscript, follow a claim to an output object, and inspect the code and test that produced it. The demonstration stops at control previews. It sends no command to a physical light, robot, camera or other actuator.

## 19. An ecosystem of complementary contributions

A useful collaboration proposal begins with respect for what the other party already does. IndraNet should not approach a mature tracking company with a diagram that quietly rebrands its localization engine as a replaceable commodity. Nor should it approach a standards community by claiming that provenance, context, or interoperability have never been considered before. Existing systems already do meaningful work in those areas. The proposed contribution is the particular cross-domain composition, its explicit semantics, and the ease with which another participant can join it.

### 19.1 Localization and live-production partners

The original discussion named zactrack, BlackTrax, Naostage, and TTA as adjacent live-tracking systems. Their published materials describe different sensing and production-integration approaches. Pozyx and KINEXON occupy industrial locating and operational environments. ZeroKey offers an acoustic positioning approach, while NavVis supplies spatial-capture and point-cloud access surfaces. These are different capabilities, not entries in a single accuracy contest. [S43–S50]

A first collaboration surface is an authorized recording plus a documented output contract. The partner supplies the native report, its time and frame conventions, device identifiers, and the meaning of quality fields. The IndraNet adapter preserves that report, creates a scoped domain interpretation, and presents it to several consumers. The demonstration should show additional uses of the partner's evidence rather than imply replacement of the partner's product.

For a live-production partner, the joint demonstration might combine performer tracking with scene-dependent effects, an XR operator view, and a replayable explanation of why a cue was proposed. For an industrial locating partner, it might connect a location report to maintenance context, an asset model, and a fleet advisory. In both cases, the interesting output is not a new dot on a map. It is a new set of trustworthy relationships around an already useful dot.

The commercial proposition is also different from hardware displacement. A partner could gain additional consumers for its data, reusable adapter contracts, and a way to participate in applications outside its immediate product scope. IndraNet could gain reliable sensing, domain expertise, and realistic operational constraints. Whether either party would value that exchange is a commercial question for actual engagement, not a conclusion of this document.

### 19.2 Standards communities as architectural collaborators

Standards groups are potential collaborators in defining mappings, profiles, and failure semantics. NGSI-LD can supply context exchange. SensorThings and its extensions can supply observation-oriented structures. GeoPose can supply pose relationships. omlox can supply locating interoperability. OpenUSD and OpenXR can supply scene and runtime interfaces. ROS and VDA 5050 can supply robotics-specific state and operational interfaces. AAS and Open-RMF add important industrial and facility relationships. [S01–S09, S51, S52]

The collaboration question is not whether all of those groups should adopt a new master schema. It is whether a small set of cross-standard examples can make their boundaries easier to compose. A common example could expose where two timestamps have different meanings, where identity is local to a system, where uncertainty is lost, or where a generated prediction enters a consumer that expects measurement.

A useful result may be a profile, a translation note, or a shared fixture rather than a new specification. A standards community could reject an IndraNet field because its own standard already provides a better construct. That is an architectural improvement. The initiative should preserve the existing construct and adjust its mapping instead of defending redundant terminology.

This posture makes the earlier standards result productive. If the building blocks are already expressive enough, the work can concentrate on coherent use, versioned mappings, process semantics, and demonstrations. The value of a shared language is not measured only by how many new nouns it introduces.

### 19.3 World-model and embodied-AI collaborators

The research corpus suggests several distinct contributions. Persistent scene-memory systems can provide object and relationship histories. Open-vocabulary mapping systems can attach evolving semantic interpretations to geometry. Executable-world systems can offer candidate dynamics, simulations, and predicted observations. Generative world models can produce plausible appearances conditioned on explicit or implicit state. [S14–S42]

A collaboration should ask for the smallest released surface that carries the relevant meaning. For a scene-graph project, that may be an export of nodes, relations, timestamps, and confidence metadata. For an executable-world project, it may be a candidate program, initial conditions, a trajectory, and a record of the evidence used. For a generative model, it may be a conditioning description and the identity of the generated output. There is no need to invent a universal model API before those concrete exchanges are understood.

An especially useful demonstration would involve two systems that disagree. One proposes that a moving object is rolling under friction. Another proposes a different contact model. IndraNet preserves the common observation, the separate Conjectures, and the simulations used to compare them. A third system can inspect the disagreement without having to reverse-engineer either model's internal state.

That is a richer collaboration target than asking both models to emit one final answer. It makes their outputs reusable as research objects. The proposed exchange can help compare explanations, identify which observations would discriminate among them, and retain the reasoning context when a later model revises the interpretation.

### 19.4 Rendering and remote-presence collaborators

A renderer does not need to solve identity, provenance, sensing, and policy in order to draw a scene. It does need a reliable contract describing what it receives. The Generative Reality work proposes such a contract around baseline assets, state changes, witnesses, dependencies, and reconstruction modes.

A first collaboration with a renderer or compression researcher could use a small recorded event. Both parties agree on the scene package, the available observations, and the allowed reconstruction mode. The researcher implements a decoder or appearance update path. IndraNet supplies the state and dependency bookkeeping. The result is inspected for which details were observed, transmitted, inferred, or generated. Rate and quality measurements can follow without becoming the prerequisite for an intelligible architectural demonstration.

The same package could support several renderers. An evidence-oriented viewer might show sparse geometry and uncertainty. A photorealistic renderer might use learned appearance priors. A creative renderer might stylize the event. The shared contract makes the distinction visible while allowing each renderer to excel at its own task.

### 19.5 What an invitation should contain

A serious partner invitation should include a concrete scene, one native input, the proposed mapping, expected outputs, and a candid boundary around what is not yet implemented. It should explain what the partner would contribute and what it would gain from the demonstration. It should not require the partner to read the entire Rosetta specification before deciding whether the idea is relevant.

The accompanying Collaboration Surface Map is designed for that conversation. It names adjacent organizations and projects only where their public materials support the described role. It distinguishes a researched capability from a proposed interface and an imagined joint demonstration. No relationship, endorsement, agreement, or willingness to collaborate is implied.

The first successful collaboration may be modest: a partner recognizes its own data in a new consumer and can trace how it got there. That is enough to begin a technical relationship. The broader vision should make the small exchange meaningful, not make it impossible to start.

![A collaboration starts with one boundary. Proposed collaboration workflow. No partner, reviewer or standards organization was contacted or represented as endorsing this candidate. Sources: E03, L12.](/research-assets/indranet/graphics/F19.svg)

**Figure F19. A collaboration starts with one boundary.** Proposed collaboration workflow. No partner, reviewer or standards organization was contacted or represented as endorsing this candidate. Sources: E03, L12.

## 20. A development program that keeps the whole proposition alive

An expansive architecture needs a disciplined route into reality. The answer is neither to build every application at once nor to discard every application except the easiest benchmark. The proposed program keeps the full map visible while selecting demonstrators that exercise reusable seams.

### 20.1 Twenty propositions, several connected tracks

The original twenty hypotheses become an intellectual roadmap in this edition. Their identifiers remain traceable to the Ignition source. They are grouped by the work they invite rather than ranked by a single confidence score. [L02]

The composition track includes the live-world interoperability proposition, the multi-consumer state proposition, standards reuse, and the relationship between IndraNet and Rosetta. These correspond to H-001, H-008, H-015, and H-019. The immediate question is what contract lets several consumers use the same evidence without losing identity, context, or epistemic status.

The sensing and deployment track includes partner-first infrastructure, modality-neutral ingestion, reference hardware, and opt-in cooperative devices: H-002, H-009, H-010, and H-014. Its first job is to connect useful existing outputs. Hardware experimentation should answer specific coverage, timing, or interoperability questions rather than become a separate obligation to manufacture a new sensing platform.

The application track includes industrial adoption, live entertainment as a lighthouse, and privacy-minimized safety. H-011, H-012, and H-013 ask where the shared architecture produces a compelling experience or operational improvement. H-018 supplies the connected ecosystem question: how open interchange and differentiated implementation businesses might reinforce each other. Each domain has different users, rights, latency needs, and consequences. Reuse should be demonstrated at the contract level rather than assumed from a common project name.

The Generative Reality track includes client-side reconstruction, semantic surprise, epistemic typing, three-strata delivery, rendering contracts, state/appearance separation, semantic derivability, and the potential novelty of the combined mechanism. These are H-003 through H-007, H-016, H-017, and H-020. Their early outputs are concrete scene, state, witness, and receiver contracts. Their later outputs may include empirical media and task studies. The registry records the specific original formulation and the current interpretation of each proposition, including where this grouping is only a planning convenience.

These tracks are connected. A good sensing adapter helps performance and warehouse demonstrations. A context contract helps a robot advisory and an evidence-faithful renderer. A revision mechanism helps maintenance, scene memory, and remote reconstruction. A privacy projection helps public-space operations and remote attendance. The program should exploit those relationships deliberately.

### 20.2 First demonstrator: one responsive room

The first demonstrator should make the central idea visible. Use one authorized tracking stream, one explicit mode controller, a small inventory of physical objects, and two downstream consumers. The same gesture should produce different proposed effects under different contexts. An inspection view should show the received signal, the interpretation, the context revision, the proposed effect, and the resulting feedback when a real endpoint is later connected.

This first room does not require a novel positioning engine. A partner output, a recorded stream, or a clearly labeled simulation can supply the location evidence. The mode change and semantic binding are the parts that must be explicit. The first successful demonstration is not “a light moved.” It is “the room's behavior changed coherently with its context, and another system can inspect why.”

The next extension adds a second consumer with a different purpose. An XR display can show the interpreted event and selected object. A recorder can preserve the process. A remote renderer can use the same state while respecting a different appearance contract. That extension tests whether the architecture is genuinely shared or merely a single-purpose controller with elaborate metadata.

### 20.3 Second demonstrator: a shared industrial context

The industrial demonstrator introduces asynchronous evidence and operational disagreement. Combine a locating report, a robot or fleet status message, a zone definition, and an asset or maintenance record. Present the result through an operator view and a robot-advisory view. Include stale observations and conflicting identity or location reports by design.

The key output is a useful, inspectable context rather than autonomous motion. A human should be able to answer which report is current, which frame applies, why two sources disagree, and what the advisory does not know. A fleet system should receive a bounded, purpose-specific input that does not claim authority over its own safety or control functions.

This demonstration also exposes deployment economics. It can reveal which integration work repeats across consumers, which native mappings are reusable, and which domain-specific assumptions remain expensive. Those observations can inform partner discussions without pretending to establish a market size or universal return on investment.

### 20.4 Third demonstrator: evidence-aware remote presence

The remote-presence demonstrator should begin with a short, controlled event and a small baseline scene package. A sender provides state changes and selected witnesses. A receiver supports at least an evidence-oriented mode and a perceptually reconstructed mode. The viewer can inspect the provenance of one visible detail and the reason another detail is uncertain or synthesized.

A deliberately novel event makes the architecture educational. Introduce a new object, an unexpected appearance, or a changed sign that the baseline cannot know. The receiver should need a fresh witness for faithful reconstruction. That is not an embarrassing failure of the concept. It is the behavior that distinguishes a system for conveying reality from a system for generating plausible imagery.

Once the dependency and reconstruction contracts are stable, different codecs and renderers can compete underneath them. The later empirical work can compare total cost, latency, task performance, perceptual quality, and evidence fidelity. The architecture gives those measurements a common experimental object.

### 20.5 Parallel research collaborations

Executable-world and scene-memory collaborators need not wait for all three demonstrations. A small artifact exchange can begin in parallel. One project exports a scene graph. Another exports a candidate executable explanation. A reference consumer connects both to the same evidence and records their different roles.

The first target should be a narrow, intelligible scene: a moving object, a changing obstacle, or a repeated action. The value is in preserving the chain across implementations. More complex model integration can follow after both sides agree on what their artifacts mean.

Reference hardware also belongs in a parallel, optional lane. A reproducible sensor node could reduce experimentation cost, but it should not block software collaboration. The hardware interface must make calibration, time, frame, and quality explicit. It should not force one localization method on every participant.

### 20.6 Maturity gates that enable progress

The program needs gates, but they should match the phase. During proposition development, the gate is conceptual and architectural clarity: can a collaborator understand the proposed composition and identify a contribution? During local prototyping, the gate is executable behavior: do the examples produce the stated artifacts and expose failure states? During partner integration, the gate is actual exchange: do two independently operated systems interpret the contract consistently?

Deployment adds other gates: operational reliability, security, privacy, maintainability, and domain-specific assurance. A public safety or robotics use requires a different assurance case from a creative stage effect. Those distinctions should be planned now without pretending that every future requirement must be solved before a research prospectus can exist.

The roadmap therefore records dependencies and evidence requirements rather than fictional dates or staffing. A branch advances when its prerequisite artifact exists and its owner can inspect the result. A promising idea remains visible even when it is not the next implementation task. That is how a broad research program avoids both premature collapse and uncontrolled expansion.

![Advance by evidence, not by labels. Development gates. A strong standards composition may remove the need for new encoding while leaving a reusable profile and integration program. All external release gates remain human-controlled. Sources: E01, E03, L12.](/research-assets/indranet/graphics/F20.svg)

**Figure F20. Advance by evidence, not by labels.** Development gates. A strong standards composition may remove the need for new encoding while leaving a reusable profile and integration program. All external release gates remain human-controlled. Sources: E01, E03, L12.

## 21. The proposition

IndraNet proposes that a place can become a shared computational context without being reduced to one vendor's map, one model's prediction, or one application's database. Its physical evidence can remain attached to the systems that produced it. Its interpretations can remain plural. Its processes can remain inspectable. Its consumers can receive different views without losing their relationship to a common history.

The independent IndraNet contract supplies the shared boundary; the optional Rosetta companion supplies a richer organizing trace: a thin semantic spine, explicit evidence and interpretation, content-addressed lineage, and extensions that preserve outside authority. IndraNet gives that philosophy a concrete domain in which humans, devices, robots, renderers, and AI systems encounter the same changing world.

The opportunity is composition. A localization vendor need not become a world-model company. A scene-graph researcher need not build a lighting console. A renderer need not become a fleet manager. A robotics framework need not define every form of remote presence. They need interfaces that let their useful work participate in a larger environment without surrendering its meaning.

The responsive room makes the idea tangible. The warehouse makes its asynchronous and operational demands visible. XR makes shared identity and context unavoidable. Public-space applications expose the importance of purpose and privacy. Executable-world research gives the fabric competing explanations and simulations. Generative Reality asks how much of an experience can be conveyed through shared structure, and where fresh evidence remains indispensable.

None of those possibilities is established merely by describing it. They are nevertheless legitimate objects of engineering and collaboration. This publication develops them far enough to expose interfaces, dependencies, examples, and concrete contributions that another team could take up.

The invitation is straightforward: bring the piece you already build well. Let us work out what it could do when the surrounding world can be represented, interpreted, and exchanged with equal care.

## References

**[L01] IndraNet author ideation, 26-message unabridged export.** Accessed 2026-09-15. Author-controlled project source; reference path in the research package.

**[L02] IndraNet Research Ignition & Stage 1 Control v0.1.** Accessed 2026-09-28. Author-controlled project source; reference path in the research package.

**[L03] Spatial Data Fabric Topic Corpus - Research Index v0.1.** Accessed 2026-09-28. Author-controlled project source; reference path in the research package.

**[L04] Rosetta v3.0.0 Core Spine Specification.** Accessed 2026-09-28. https://github.com/entif-ai/rosetta/blob/1fc05c404d15fa7cc9713e7ee19d87b94316f07a/docs/RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md

**[L05] Rosetta v3 Protocol Roadmap, 7 September 2026.** Accessed 2026-09-15. Author-controlled project source; reference path in the research package.

**[L06] Spatial Data Fabric / Mixed-Reality Performance Stage, 20251106.** Accessed 2026-09-15. Author-controlled project source; reference path in the research package.

**[L07] UWB, SDF and Non-Profits.** Accessed 2026-09-15. Author-controlled project source; reference path in the research package.

**[L08] Code-as-World and Asymmetric Wealth, 20260901.** Accessed 2026-09-15. Author-controlled project source; reference path in the research package.

**[L09] IndraNet Stage 2 v0.2.0 frozen package.** Accessed 2026-09-15. Author-controlled project source; reference path in the research package.

**[L10] IndraNet v0.3.0 synthesis repair.** Accessed 2026-09-15. Author-controlled project source; reference path in the research package.

**[S01] NGSI-LD.** ETSI GS CIM009 V1.9.1, July 2025. https://ngsild.org/cim009/html/index.html

**[S02] SensorThings API Part 1 Sensing 1.1.** 2021-08-04. https://docs.ogc.org/is/18-088/18-088.html

**[S03] OGC STAplus 1.0.** Accessed 2026-09-15. https://docs.ogc.org/is/22-022r1/22-022r1.html

**[S04] GeoPose 1.0.** 2023-09-08. https://docs.ogc.org/is/21-056r11/21-056r11.html

**[S05] omlox Hub and API.** Accessed 2026-09-28. https://omlox.com/omlox-explained/omlox-hub-and-api

**[S06] AOUSD Core Specification 1.0 announcement; published Core 1.0.1 artifact.** 2025-12-12. https://github.com/aousd/specifications-public

**[S07] OpenXR spatial entities extensions.** 2025-06-10. https://github.com/KhronosGroup/OpenXR-Docs/blob/main/CHANGELOG.Docs.md

**[S08] ROS tf2 coordinate-frame tree.** Accessed 2026-09-28. https://docs.ros2.org/foxy/api/tf2/

**[S09] VDA 5050 3.0.0.** 2026-03-19. https://github.com/VDA5050/VDA5050/releases

**[S10] W3C PROV-O.** Accessed 2026-09-15. https://www.w3.org/TR/prov-o/

**[S11] W3C/OGC Semantic Sensor Network ontology.** Accessed 2026-09-15. https://www.w3.org/TR/vocab-ssn/

**[S12] W3C Web of Things Thing Description 1.1.** Accessed 2026-09-15. https://www.w3.org/TR/wot-thing-description11/

**[S13] Open Sound Control 1.0.** Accessed 2026-09-15. https://opensoundcontrol.stanford.edu/spec-1_0.html

**[S14] Code as Worlds: Agentic Discovery of Executable World Representations for Physical Reasoning.** 2026-08-27. https://arxiv.org/abs/2608.27549

**[S15] Code-as-World released reference implementation.** Accessed 2026-09-15. https://github.com/MirroS-Lab/Code-as-World

**[S16] PhysMind: From Video to Executable Worlds for Training-Free Physical Reasoning.** 2026-08-05. https://arxiv.org/abs/2608.04575

**[S17] Deployment-Ready UWB Localization for Industrial Ground Robots with Automatic Anchor Calibration and Terrain-Aware Fusion.** Accessed 2026-09-15. https://arxiv.org/abs/2607.15807

**[S18] DGSG-Mind: Dynamic 3D Gaussian Scene Graphs for Long-Term Scene Understanding and Grounding.** Accessed 2026-09-15. https://arxiv.org/abs/2605.29879

**[S19] FUS3DMaps: Scalable and Accurate Open-Vocabulary Semantic Mapping by 3D Fusion of Voxel- and Instance-Level Layers.** Accessed 2026-09-15. https://arxiv.org/abs/2605.03669

**[S20] MVISTA-4D: View-Consistent 4D World Model with Test-Time Action Inference for Robotic Manipulation.** Accessed 2026-09-15. https://arxiv.org/abs/2602.09878

**[S21] EmbodMocap: In-the-Wild 4D Human-Scene Reconstruction for Embodied Agents.** Accessed 2026-09-15. https://arxiv.org/abs/2602.23205

**[S22] HoloAgent-0: A Unified Embodied Agent Framework with 3D Spatial Memory.** Accessed 2026-09-15. https://arxiv.org/abs/2606.23565

**[S23] Decentralized Cooperative Localization for Multi-Robot Systems with Asynchronous Sensor Fusion.** Accessed 2026-09-15. https://arxiv.org/abs/2603.12075

**[S24] Decentralized and Fully Onboard: Range-Aided Cooperative Localization and Navigation on Micro Aerial Vehicles.** Accessed 2026-09-15. https://arxiv.org/abs/2602.16594

**[S25] Expanding Spatial and Temporal Context for Robotic Imitation Learning With Scene Graphs.** Accessed 2026-09-15. https://arxiv.org/abs/2606.01072

**[S26] OVI-MAP: Open-Vocabulary Instance-Semantic Mapping.** Accessed 2026-09-15. https://arxiv.org/abs/2603.26541

**[S27] Teaching Foundation Models to Read mmWave: Pose-Guided Kinematic Representation for Human Behavior Understanding.** Accessed 2026-09-15. https://arxiv.org/abs/2608.04127

**[S28] Vision-Based Safe Human-Robot Collaboration with Uncertainty Guarantees.** Accessed 2026-09-15. https://arxiv.org/abs/2604.15221

**[S29] PhysX-CoT: Structured Physical Reasoning from a Single Image to Simulation-Ready 3D Assets.** Accessed 2026-09-15. https://arxiv.org/abs/2608.08053

**[S30] DSG: Dynamic 3D Scene Graph Construction for Embodied Agents in Changing Indoor Environments.** Accessed 2026-09-15. https://arxiv.org/abs/2609.00619

**[S31] RynnWorld-4D: 4D Embodied World Models for Robotic Manipulation.** Accessed 2026-09-15. https://arxiv.org/abs/2607.06559

**[S32] Vision-Based Human Awareness Estimation for Enhanced Safety and Efficiency of AMRs in Industrial Warehouses.** Accessed 2026-09-15. https://arxiv.org/abs/2604.18627

**[S33] Cloak of Invisibility: Real-Time Privacy-Preserving Volumetric Video Streaming.** Accessed 2026-09-15. https://arxiv.org/abs/2608.11645

**[S34] Lyra 2.0.** 2026-04-14. https://arxiv.org/abs/2604.13036

**[S35] Marionette.** 2026-08-14. https://arxiv.org/abs/2608.14530

**[S36] Programmable World Model.** 2026-09-09. https://arxiv.org/abs/2609.10540

**[S37] StateFlow: Building, Evolving, and Accessing 3D World States for Previsualization.** 2026-08-12. https://arxiv.org/abs/2608.12314

**[S38] CGWorld.** 2026-07-29. https://arxiv.org/abs/2607.26452

**[S39] Causal Diffusion for Ultra-Low Bitrate Video Compression.** v1 2026-02-14; v2 2026-05-07. https://arxiv.org/abs/2602.13837

**[S40] DiSCo: Low-Bitrate Video Compression through Semantic-Conditioned Diffusion.** v1 2025-11-29; v2 2026-04-06. https://arxiv.org/abs/2512.00408

**[S41] QUEEN: QUantized Efficient ENcoding of Dynamic 3D Gaussians for Streaming Free-viewpoint Videos.** NeurIPS 2024. https://research.nvidia.com/labs/amri/projects/queen/

**[S42] Random-Access Neural Compression of Material Textures.** Accessed 2026-09-15. https://research.nvidia.com/publication/2023-08_random-access-neural-compression-material-textures

**[S43] zactrack PRO.** Accessed 2026-09-28. https://www.zactrack.com/zactrack-pro-system

**[S44] BlackTrax.** Accessed 2026-09-28. https://cast-soft.com/blacktrax/

**[S45] Stagetracker II.** Accessed 2026-09-15. https://tta-sound.com/

**[S46] Naostage KAPTA.** Accessed 2026-09-15. https://www.naostage.com/en/produits-2/kapta

**[S47] Pozyx and omlox.** Accessed 2026-09-15. https://omlox.com/pozyx

**[S48] KINEXON OS.** Accessed 2026-09-15. https://kinexon.com/products/kinexon-os

**[S49] ZeroKey Quantum RTLS technology.** Accessed 2026-09-15. https://zerokey.com/technology/

**[S50] NavVis IVION Point Streaming API usage guide.** Accessed 2026-09-15. https://knowledge.navvis.com/docs/point-streaming-api-usage-guide

**[S51] Asset Administration Shell specification catalog.** Release 26-01. https://industrialdigitaltwin.io/aas-specifications/index/home/index.html

**[S52] Open-RMF.** Accessed 2026-09-28. https://www.open-rmf.org/

**[S53] PileBelief: Persistent Physical State for Interaction-Driven World Modeling.** 2026-09-19. https://arxiv.org/abs/2609.22858

**[S54] A Topological Representation with Object-Path Graphs for Open-Vocabulary Instance Navigation.** 2026-09-21. https://arxiv.org/abs/2609.24189

**[S55] Astronex-World1.0: Real-Time Interactive World Model Foundation.** 2026-09-17. https://arxiv.org/abs/2609.20034

**[S56] Interoperability Test Bed support for ETSI and NGSI-LD.** 2026-09-16. https://interoperable-europe.ec.europa.eu/collection/interoperability-test-bed-repository/solution/interoperability-test-bed/news/itb-support-etsi-and-ngsi-ld

**[L11] Later unabridged author production conversation.** Accessed 2026-09-28. Author-controlled project source; reference path in the research package.

**[L12] Rosetta live authority and implementation pin.** Accessed 2026-09-28. Author-controlled project source; reference path in the research package.

**[E01] Executed local reference validation.** Accessed 2026-09-28. Author-controlled project source; reference path in the research package.

**[E02] Six generated contextual stories.** Accessed 2026-09-28. Author-controlled project source; reference path in the research package.

**[E03] Full standards-runtime comparison design.** Accessed 2026-09-28. Author-controlled project source; reference path in the research package.

**[E04] Preserved integration and validator rerun.** Accessed 2026-09-28. Author-controlled project source; reference path in the research package.
