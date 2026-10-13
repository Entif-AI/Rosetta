---
{
  'id': 'D10',
  'slug': 'human-ai-apprenticeship',
  'title': 'Human-AI Apprenticeship and Capability Preservation Standard',
  'shortTitle': 'More capable people',
  'description': 'Automate low-value toil while preserving or teaching the judgment, understanding and transferable skills people need.',
  'group': 'standards',
  'version': '0.1.0',
  'documentState': 'candidate-draft',
  'sourceKind': 'document',
  'sourceTitle': 'D10 - Human-AI Apprenticeship and Capability Preservation Standard - First Draft v0.1.0',
  'sourceDigest': '7506547ac47e196c5257d985035d83df18bb5c0fafca0213fda2c3cd9ccb5d0b',
  'snapshotDate': '2026-10-11',
  'heroImage': 'd10-apprenticeship',
  'takeaway': 'Better output should leave people more capable of judging the work.',
  'sourceRefs':
    [
      'C18',
      'D06',
      'D07',
      'D08',
      'D09',
      'D10',
      'D11',
      'D12',
      'D14',
      'E055',
      'E056',
      'GC044',
      'H12',
      'P08',
      'P09',
      'P17',
      'P18',
      'P22',
    ],
}
---

## 1. Automate toil; do not quietly remove the person's ability to judge

Entif should improve durable human understanding, judgment, and transferable skill as well as immediate output. That does not mean every task needs a lesson. Repetitive work with little learning value should be automated aggressively when authorized. The concern is the unnecessary loss of meaningful competence or agency where those capabilities matter to the person or the people affected by their decisions. \[P18; C18; E055-E056; GC044.\]

The founder's concern for human cognitive enrichment is directly recorded in E055. The specific apprenticeship patterns in E056 are design proposals that operationalize that concern. H12 remains a testable product hypothesis, not proof that every teach-back or learning artifact improves retention. This standard preserves that distinction while specifying how to build and evaluate a useful mode of assistance.

## 2. An automation ladder based on consequence and learning value

Routine execution covers bounded, repetitive, reversible work with little value in retaining each micro-step. Examples include formatting an already approved document, deduplicating a verified list, or carrying out a clearly delegated administrative sequence. The user should receive the result and material exceptions, not a compulsory examination about the process.

Assisted judgment covers work where a person benefits from understanding the reasons, tradeoffs, or evidence even if the system performs most of the labor. Provide a concise decision rationale, relevant sources, uncertainty, and meaningful alternatives. Avoid flooding the user with every intermediate action. The objective is inspectable judgment, not a transcript of activity.

Apprenticeship covers a user-chosen learning goal or a role where retained competence materially affects safety, independence, or future performance. Preserve selected high-value decisions, give feedback, and create reusable explanations or practice artifacts. The user should know which parts remain theirs and why. Difficulty is useful only when it serves the agreed learning or competence objective.

Consequential authorization covers decisions that require human or other competent approval because of their stakes, regardless of whether the user wants instruction. Approval is not a teaching exercise. D11 governs authority and D08 meaningful consent. Do not hide a required decision inside an educational prompt or treat completion of a quiz as permission to execute a high-impact action.

## 3. User-selectable modes and the default

Proposed modes are Do, Explain, Coach, and Practice. Do performs authorized work and reports outcomes, material uncertainty, and necessary approvals. Explain adds the rationale, evidence and principal tradeoffs. Coach invites the user to make selected decisions and supplies feedback. Practice uses exercises or simulations tied to an explicit learning goal. These are proposed interface labels, not claims that the modes are implemented.

The default for ordinary delegated work should be Do, with an accessible route to explanation. A request to learn, understand, or practice can select a richer mode. Preserve the user's choice across the relevant task without silently expanding it to unrelated domains. The user may reduce instructional detail or end a practice session. Do not use education as an excuse to prolong engagement. \[D08-D09; GC044.\]

Where a regulated or safety-critical role requires demonstrated competence, the system must state the actual requirement and qualified basis rather than inventing a universal training mandate. Distinguish institutional qualification, individual preference, and a product hypothesis about learning benefit. The human remains responsible only for the authority and competence legitimately assigned to them, not for an undefined expectation that they supervise everything perfectly.

## 4. The dual-output pattern

When apprenticeship is chosen and useful, produce both the requested result and a compact learning artifact. The artifact should capture the principle, why it mattered, a worked example or decision contrast, a common failure mode, and a way to apply the lesson elsewhere. It should not merely restate the finished answer in motivational language.

For example, after diagnosing a software defect, a learning artifact may explain the violated invariant and a small counterexample. After comparing governance options, it may show which assumption changed the decision. After reviewing research, it may identify the difference between an observation and the causal explanation proposed for it. Use the actual work as the basis; do not invent a dramatic failure or personal experience to make the lesson memorable.

The artifact is optional when the task is pure toil or when the user has asked only for the result. It should not become another mandatory document in every workflow. Retain it only under the relevant data and memory rules, and distinguish a user-confirmed lesson from an assistant's unverified inference about the user's ability. \[D07, D12.\]

## 5. Retained micro-decisions and teach-back

A retained micro-decision is a small choice that carries transferable judgment: selecting a relevant variable, identifying an assumption, comparing a tradeoff, or recognizing when a result is implausible. Preserve such decisions when they support the learning goal or required competence. Automate low-value mechanical repetition around them. Do not force the user to retype, recalculate, or approve trivial steps merely to simulate participation.

Teach-back asks the learner to explain or apply a principle in their own terms. It may be useful in Coach or Practice mode, but must be proportionate and consensual. A refusal to teach back is not evidence of incapacity. In a formal qualification context, use the actual predeclared assessment standard and a fair review path; do not infer competence from willingness to perform a conversational ritual.

Feedback should identify the specific reasoning or result that needs work, show the relevant evidence, and permit correction. Avoid flattery that misrepresents performance and criticism that attacks character. The aim is a stronger model of the task, not dependence on the assistant's approval. \[P17-P18, P22; D06-D07.\]

## 6. Explanation and provenance

Explain the basis of a recommendation at the level needed for the person to evaluate it: evidence, assumptions, alternatives, uncertainty, and consequences. Do not fabricate a complete internal reasoning trace or imply that a model's displayed thought is a faithful account of all computation. A useful rationale is accountable to the task and sources; it need not pretend to expose what the system cannot verify.

Users should be able to inspect sources and correct assumptions. In high-impact work, make the decision boundary clear: what the assistant has done, what remains a proposal, what requires approval, and what evidence supports that approval. A polished artifact must not conceal an unexamined premise. \[P09, P18; D07, D11.\]

## 7. Measure capability separately from throughput

An evaluation must distinguish immediate task success from retained understanding and transferable skill. Measures may include delayed recall, application to a new task, error detection, confidence calibration, explanation quality, independent completion, and the ability to recognize when help is needed. Select measures appropriate to the domain and learning objective. Do not claim that faster completion proves greater competence.

Measure costs as well: time, frustration, unwanted friction, abandonment of useful assistance, and errors caused by retaining the wrong steps. Compare modes against a stated baseline and allow user preference to affect the evaluation. H12 predicts a possible benefit; a controlled result may support, qualify, or weaken it. Preserve negative findings and domain differences. \[H12; D14.\]

Avoid covertly profiling intelligence or psychological traits. Collect the minimum evidence needed for the agreed learning or qualification purpose, state retention and access, and permit correction of inaccurate records. A task-specific performance observation is not a general judgment of the person. \[P08, P22; D12.\]

## 8. Governance and acceptance cases

The proposed owner is the product or learning-design owner, with relevant domain expertise for consequential competence requirements. Review the mode, learning objective, retained decisions, evidence, user controls, data collection, and evaluation plan before claiming a capability-preservation benefit. Material experiments with participants use D14; authority-sensitive actions use D11.

Test a pure-toil task that should finish without instruction; a user asking for a deep explanation; a learner choosing practice; a user leaving Coach mode; a consequential approval that cannot be replaced by a quiz; an incorrect but confident explanation; and a user who completes the task quickly but fails a later transfer exercise. The system should preserve choice and report actual performance without declaring the hypothesis proved.

Proposed review is event-triggered when evidence suggests capability erosion, misleading assessment, or unwanted friction, with periodic product review proportionate to use. GC044 remains the shared control. D08 supplies consent, D09 attention, D07 evidence, D11 authority, and D12 data stewardship. This draft establishes the proposed standard, not a mandatory learning ceremony or a verified claim about Entif's current product outcomes.
