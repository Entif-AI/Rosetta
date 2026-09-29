---
id: entif.project.indranet
slug: indranet
title: IndraNet
kind: project
status: published
published: 2026-09-28
authors:
  - Entif AI
description: IndraNet is Entif AI's physical-context research program for qualified spatial state, evidence-preserving interoperability, and purpose-scoped views across embodied systems.
tags:
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
sourceRefs:
  - ETR-2026-06 IndraNet v0.5.0 manuscript
  - https://github.com/entif-ai/indranet
featured: true
noindex: false
---

## Shared physical context without flattening the evidence

IndraNet is an experimental physical-context exchange architecture for systems that need to refer to the same changing world without pretending they share one universal view.

A tracker can report a pose. A robot can report a local state. A technician can attach a maintenance note. A simulation can produce a counterfactual. An XR client can need a spatial anchor, while a remote attendee needs geometry, motion, sound, and fresh appearance evidence. IndraNet explores how those contributions can remain distinguishable while still participating in a common context.

The central contract is qualified state: what was reported, where and when it applies, when it became known, which source or derivation produced it, what remains uncertain, and which purposes may use it.

## Two layers by design

The standalone IndraNet exchange is independently usable. Its candidate records preserve spatial frame, time, evidence role, quality, revision history, purpose limits, and mapping loss without requiring Rosetta.

An optional Rosetta companion projects that exchange into immutable observations, interpretations, contextual state, alternatives, evaluations, and receipts. The companion reuses Rosetta Core meaning where it fits and uses namespaced `indranet.*` structures for the physical-context domain.

Neither layer turns a digest into physical truth or a compatible operation into authority to act.

## What the current reference demonstrates

The v0.5.0 candidate includes a Python reference implementation, a candidate context Pack, explicit selected-field mappings, deterministic synthetic scenarios, and negative tests for ambiguity, stale state, purpose expansion, revision history, frame errors, unsupported inference, and tampering.

The supplied production validation reports 120 passing unit tests, 270 synthetic native records, 540 selected-profile round trips, 24 candidate schemas, and 59 companion Tiles across six scenario families. These are bounded implementation results. They do not establish live vendor interoperability, official standards conformance, safety certification, or the performance of an unbuilt neural receiver.

## Generative Reality

One research branch asks whether a receiver can reconstruct an event from a prepared world prior, changing state, and selective fresh witnesses instead of repeatedly transmitting every appearance from scratch.

The current package specifies and simulates the contract around that idea. It does not claim a trained decoder, a measured bandwidth advantage, or evidence-faithful photorealistic reconstruction.

## Evaluate the work

Read [ETR-2026-06](/tags/research/2026/09/28/indranet-research/) for the full proposition, architecture, use cases, source registry, and research agenda.

[Inspect IndraNet on GitHub](https://github.com/entif-ai/indranet) for the reference implementation, candidate Pack, deterministic fixtures, provenance notes, and open-work ledger.
