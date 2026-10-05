---
id: entif.project.indranet
slug: indranet
title: IndraNet
kind: project
status: published
published: 2026-09-28
authors:
  - Entif AI
description: IndraNet is Entif AI's relational fabric for independently bounded cognitive participants, with a current reference specialization in qualified physical context, embodied systems, and evidence-preserving world interaction.
tags:
  - distributed-cognition
  - swarm-gnosis
  - spatial-computing
  - embodied-ai
  - digital-twins
  - provenance
  - interoperability
  - xr
projects:
  - indranet
related:
  - entif.research.indranet
  - entif.project.rosetta
  - entif.project.codito
sourceRefs:
  - ETR-2026-06 IndraNet v0.5.0 manuscript
  - ETR-2026-12 Unified Cognitive Architecture v0.5.8
  - https://github.com/Entif-AI/IndraNet
featured: true
noindex: false
---

## A relational fabric among Jewels

IndraNet is used at two resolutions in the Unified Cognitive Architecture.

At the broad architectural level, **IndraNet is the relational fabric among independently bounded participants called Jewels**. A Jewel may be a model runtime, a personal sovereign instance, a server, a specialized service, a robot, a sensor-actuator assembly, or another independently addressable participant. It may possess cognition, memory, inference, observation, communication, embodiment, actuation, or only a subset of them.

Embodiment is optional. The participant boundary is the point.

At the current reference-implementation level, IndraNet deliberately narrows that larger fabric to a hard and useful proving surface: **qualified physical context** across sensing, frames, time, simulation, rendering, and actuation. The physical-context work is therefore a specialization of the broader idea, not the claim that every Jewel is a robot or that every IndraNet interaction is spatial.

`Jewel` is a UCA participant-level term. It is not a new Rosetta Core kind, and it does not replace ordinary graph, compute, scene, or network nodes inside a Jewel.

## Why the name?

The architectural mnemonic comes from the later Buddhist and Huayan image commonly called **Indra's Net**: a vast net whose junctions hold multifaceted jewels, each reflecting the others and participating in a larger web of relation.

IndraNet does not claim to instantiate a religious cosmology. The image is useful because it refuses two bad abstractions at once: the participant is neither an isolated atom nor an undifferentiated fragment of one central supermind. Each Jewel can remain locally bounded while its relationships become part of a larger cognitive ecology.

## Swarm Gnosis

The cognitive consequence of those relationships is **Swarm Gnosis**.

A useful federation does not require every Jewel to upload its private memory, internal prompts, proprietary policy, or model state. It requires useful artifacts to cross boundaries with enough semantic structure to remain inspectable:

- what the artifact is;
- where it came from;
- which evidence or computation produced it;
- which rights and purposes apply;
- what uncertainty or alternatives remain;
- what must happen if its source is corrected;
- and whether the receiving Jewel is actually allowed to rely on it.

One Jewel can originate an observation. Another can contribute a method. A third can independently challenge a result. A stronger general model can synthesize only the residual that still requires it. A receiving Jewel admits the artifact under its own policy instead of importing the sender's authority by default.

That is distributed cognitive capital, not a global shared prompt.

## Shared physical context without flattening the evidence

The present v0.5.0 reference path focuses on systems that need to refer to the same changing physical world without pretending they share one universal view.

A tracker can report a pose. A robot can report a local state. A technician can attach a maintenance note. A simulation can produce a counterfactual. An XR client can need a spatial anchor, while a remote attendee needs geometry, motion, sound, and fresh appearance evidence.

The central contract is qualified state: what was reported, where and when it applies, when it became known, which source or derivation produced it, what remains uncertain, and which purposes may use it.

## Two implementation layers by design

The standalone IndraNet exchange is independently usable. Its candidate records preserve spatial frame, time, evidence role, quality, revision history, purpose limits, and mapping loss without requiring Rosetta.

An optional Rosetta companion projects that exchange into immutable observations, interpretations, contextual state, alternatives, evaluations, and receipts. The companion reuses Rosetta Core meaning where it fits and uses namespaced `indranet.*` structures for the physical-context domain.

Neither layer turns a digest into physical truth or a compatible operation into authority to act.

## What the current reference demonstrates

The v0.5.0 candidate includes a Python reference implementation, a candidate context Pack, explicit selected-field mappings, deterministic synthetic scenarios, and negative tests for ambiguity, stale state, purpose expansion, revision history, frame errors, unsupported inference, and tampering.

The supplied production validation reports 120 passing unit tests, 270 synthetic native records, 540 selected-profile round trips, 24 candidate schemas, and 59 companion Tiles across six scenario families. These are bounded implementation results. They do not establish live vendor interoperability, official standards conformance, safety certification, a globally deployed Jewel federation, or the performance of an unbuilt neural receiver.

## Generative Reality

One research branch asks whether a receiver can reconstruct an event from a prepared world prior, changing state, and selective fresh witnesses instead of repeatedly transmitting every appearance from scratch.

The current package specifies and simulates the contract around that idea. It does not claim a trained decoder, a measured bandwidth advantage, or evidence-faithful photorealistic reconstruction.

## Evaluate the work

Read [ETR-2026-06](/tags/research/2026/09/28/indranet-research/) for the physical-context proposition, architecture, use cases, source registry, and research agenda.

[Inspect IndraNet on GitHub](https://github.com/Entif-AI/IndraNet) for the reference implementation, candidate Pack, deterministic fixtures, provenance notes, and open-work ledger.
