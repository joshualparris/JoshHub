# JoshHub — short-answer-first, Socratic AI assessment
**Implemented:** 11 October 2026 · **Status:** on `main`, validated by GitHub QA. Vercel production may still point to an older commit while the daily deployment limit is active.

## Why this matters

A learner replied to a Repair Café scenario:

> "Sewing and laptops inside but bicycle repair outside"

The existing form rejected it before consulting Groq because it required 24 words, a punctuation mark, and the canonical multiple-choice answer. This correctly recognised missing conditions, but did not recognise the creative possibility that bicycle repairs could be proposed for a separately authorised outdoor area.

This change **does not automatically declare outdoor bicycle repairs safe**. The hall explicitly excluded bicycles, so the learner should explain who controls the outdoor space, whether the host permits this separate activity, and whether insurance, access, safeguarding and safety plans cover it. The proper early response is a **focused clarification**, not rote failure or unconditional approval.

## Learner experience

1. **Write first**, in the learner's own words; short but meaningful responses are allowed, and no formal sentence punctuation or arbitrary 24-word minimum is required.
2. **Multiple-choice is optional**, offered for comparison rather than as a mandatory gate.
3. Groq grades the scenario reasoning with reference facts and real-world constraints.
4. Outcomes: **Pass** when the decision has sufficient evidence and safe boundaries; **Clarify** for a promising idea missing one consequential fact; **Revise** for an unsafe or unjustified plan.
5. For Clarify, Groq asks **one specific, answerable question**, and the learner can respond with a brief follow-up. The whole original answer + follow-up is reassessed.
6. The current adaptive quiz distinguishes independent first-attempt mastery from **coached progress**; supported completion does not inflate the independent mastery count.
7. Drafts are not locally stored. Only submitted text is sent server-side to Groq. Do not submit client credentials or personal volunteer details.

### Examples of good and weak feedback

Initial learner idea:
> Sewing and laptops inside but bicycle repair outside.

**Good feedback:** "Using a separate area is a sensible possibility. Does the venue owner permit bicycle repairs outdoors, and are that location and activity covered by the event's insurance and risk assessment?" The learner may answer concisely, e.g. "Only with written permission, suitable insurance, accessible paths and a safe work zone."

**Incorrect feedback:** "Wrong. You didn't pick option B." Or "You must write at least 24 words." Or "Approved: bicycles may be fixed outside" without checking authority.

This is a **calibration example**, not a verified live-model output.

## Code

- `src/lib/learning/ai-grading.ts`: concise non-filler input validation; optional MCQ; rubric status and hard pass thresholds.
- `src/app/api/learning/grade/route.ts`: Groq system prompt recognises conditional alternatives, returns `pass|clarify|revise` and one targeted question.
- `src/components/learn/AdaptiveSimQuiz.tsx`: text-first experience, optional choice comparison, clarification, revised response and honest independent-mastery record.
- `src/components/learn/FieldGuideProgress.tsx`: same approach for the Dubbo business and e-waste outreach learning checks.
- `src/components/learn/RepairCafeSimulator.tsx`: final debrief can request a focused follow-up.
- `src/lib/learning/assessment-dialogue.ts`: dialogue result and coached-progress logic.
- `src/lib/learning/assessment-dialogue.test.ts`: tests the exact short bicycle idea, punctuation loophole, optional answer and follow-up/mastery behaviours.

## Safety and accuracy

- A model might hallucinate an approval or unfairly grade a concise answer. This is an educational aid, **not** real-world event authorisation or professional qualification.
- The server computes mastery gates; the model's `status=pass` cannot override low understanding/evidence/risk rubric scores.
- Punctuation-only, repeated filler and copied model choices still fail cheap local checks.
- Wrong canonical answer selection is *not* a hard failure; however, meaningful conflict between selected and written plans should trigger clarification.
- Missing Groq credentials, network failures, malformed JSON, or rate limiting do not award credit.
- The in-memory IP limiter is not a durable distributed abuse-protection solution. If opened to many public users, add per-account rate limits, usage/billing controls and monitored token costs.

## Release & QA

- GitHub Actions workflow: `JoshHub Learning Lab QA`, runs Vitest learning tests and strict TypeScript checks.
- The latest checks passed on `main`. End-to-end **live Groq responses have not been verified** because the current production site is running an earlier commit.
- Production project: Vercel `josh-hub-96no`.
- **Deployment blocker (11 October):** Vercel returned HTTP 402 `api-deployments-free-per-day` (more than 100 deployments in 24 hours). The connected deployment action can't force a release until quota resets or the owner resolves the limit. No authenticated Vercel CLI fallback was available in this environment.
- Once deploying resumes, release current `main` to production and inspect the deployment's exact SHA. Test on Samsung Android in the Repair Café adaptive challenge, particularly `cafe:2`. Verify a short response first triggers clarification, an authorised outdoor proposal can progress, unapproved outdoor work doesn't pass, and dots still fail.
- During acceptance tests, use entirely fictional answers. No actual project participant details or secrets.

## Future improvements

1. Have a real Repair Café coordinator review and approve scenario facts and follow-ups, particularly venue boundary decisions.
2. Run real-user calibration: compare several genuine short responses across novice and experienced users for fairness and safety.
3. Add accessible voice dictation and optional rubric view without turning assessment into a word-length game.
4. If strong alternative answers recur, add source-reviewed branches to the scenario curriculum rather than relying entirely on the LLM.
