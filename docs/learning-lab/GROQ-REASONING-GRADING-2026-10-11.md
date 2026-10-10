# JoshHub Learning Lab — Groq reasoning assessment (11 October 2026)

## Why this exists
A learner demonstrated that `AdaptiveSimQuiz.tsx` accepted 20 dots because the written draft was not graded; only the adjacent multiple-choice selection controlled progress. The simulator previously showed "your draft is not scored or saved". That was an assessment-design flaw.

## What is now implemented
- **Exact component fixed:** `src/components/learn/AdaptiveSimQuiz.tsx`. Written justification is submitted to `POST /api/learning/grade` and graded, not ignored. Dots and other filler are rejected without advancing adaptive results.
- **Dubbo business/outreach assessments:** `FieldGuideProgress.tsx` uses the same server route; correct MCQ + substantive AI-approved rationale are both required to mark the lesson complete.
- **Repair Café debrief:** `RepairCafeSimulator.tsx` requires an AI-passed improvement plan grounded in a case, with a feasible action, alternative and outcome measure. Old 20-character-only completion is no longer enough.
- **Challenge quality:** All 22 adaptive simulator questions were replaced with plausible options. A quality test checks that correct option positions and sentence lengths are balanced.
- **Source integrity:** The server resolves scenario, correct decision and grading reference from committed, trusted course data. Browsers do not supply model answers, grading criteria or correctness flags.
- **Server-only key:** `GROQ_API_KEY` is read exclusively from Vercel's secure environment, never sent to the browser or checked into GitHub.
- **Model:** Groq production model `openai/gpt-oss-120b` (override via `GROQ_MODEL`) with JSON output mode and low reasoning effort. The former DCS PD fallback `llama-3.3-70b-versatile` is not the default because the model was deprecated for developer-tier users in August 2026.

### Grading rules
The server rejects:
- punctuation-only text, copies of choices, repeated filler and answers with fewer than 24 meaningful words / 14 distinct words;
- wrong or invalid scenario IDs, mismatched selection, oversized drafts and attempts to supply client-specified rubrics;
- responses that fail any of these four analytic dimensions: **understanding, scenario evidence, alternative evaluation, risk/uncertainty**;
- missing API credentials, network errors, malformed model output and rate limits.

The AI returns 0–4 per dimension. Passing requires `understanding >= 3`, `evidence >= 3`, `alternatives >= 2`, `risk >= 2`, `total >= 12/16`, and `substantive=true`. The server computes that threshold; it does not accept a model-generated `passed` flag. A technically correct multiple-choice guess does not confer mastery without an independent written explanation.

Feedback contains a short evidence-based summary and one actionable improvement. As in DCS PD, only the server contacts Groq; unlike the original feedback-only route, this version uses a strict completion gate.

## One-time live setup required
The DCS PD Vercel project has a **sensitive** variable called `GROQ_API_KEY`; the Vercel connection does not expose its value for safe transfer. JoshHub production has no Groq key configured. The code has been deployed/configured **fail-closed** (no artificial success, no offline grade).

In the Vercel dashboard, open **josh-hub-96no → Settings → Environment Variables** and add:
- Name: `GROQ_API_KEY`
- Value: a valid key from your Groq console (create a dedicated JoshHub key if necessary)
- Target: **Production** (and Preview only if you actively test grading there)
- Type: **Sensitive/Encrypted**

Then redeploy JoshHub so the production function sees the variable. Do not paste the key into public GitHub, client-side `NEXT_PUBLIC_` variables, student drafts, or chat.

Optional: `GROQ_MODEL=openai/gpt-oss-120b`. This is already the code default.

## Security and privacy considerations
- Same-origin POST check and basic 15 requests/hour/IP in-memory rate limiting. **This is NOT a distributed WAF or a substitute for authenticated usage caps**; serverless instances can each have independent counters. To use this API publicly at scale, add a durable per-user quota, user authentication and Groq/Vercel spend alerts/rules.
- User answers are sent to Groq on button press, not while typing, and are not stored in JoshHub's local data. Only learning progress and grading outcome flags persist on the learner's device.
- Learners must avoid customer files, credentials, real volunteer information, private school data or other sensitive material. Some prompts are fictional by design.
- AI grading is imperfect. An expert reviewer and representative learner tests are still required before treating these rubric scores as professional certification.
- Old local results remain separate under new versioned keys; there is no migration of old MCQ-only credit into AI-evaluated mastery.

## Verification
- `src/lib/learning/ai-grading.test.ts` verifies the 20-dot exploit is rejected; it also tests repeated filler, server-only question lookup, input schema and deterministic rubric thresholds.
- `src/lib/learning/sim-assessment-quality.test.ts` checks all 22 simulator scenarios, option plausibility, correct-answer position and answer-length cues.
- The full learning-lab test suite and production build are mandatory release checks.
- **Live Groq assessment cannot be verified until the real API key is configured.** After setup, test two submissions: exactly 20 dots (must reject without counting) and an original written explanation using scenario evidence and a credible alternative (should be considered under the rubric). Try an incorrect response and an API outage too.

## Further work
- Bring the three formal laptop case-file verdicts into this rubric system (they currently use deterministic two-observation and correct-family gates, not AI-graded case notes).
- Add reliable authenticated rate limiting and model-request cost monitoring before inviting the broader public to use paid AI grading.
- Conduct Android accessibility and keyboard-only end-to-end tests.
