# JoshHub LMS — Cognitive-demand and assessment-rigour audit

**Reviewed:** 11 October 2026 · **Status:** Implemented content upgrade and automated checks, with outstanding live-browser assessment QA  
**Scope:** The four bespoke courses currently linked from JoshHub Learn — The Dead Laptop Detective, Run Your Own Repair Café, Inside Dubbo's Technology Businesses, and New E-Waste Sourcing Opportunities. This is **not** a claim that every legacy IndexedDB topic or course elsewhere has been audited.

## What the original assessments demanded

| Course | Pre-upgrade issues | Most common cognitive demand | New work |
|---|---|---|---|
| Dead Laptop Detective | 16 elementary questions, many with two absurd alternatives; 12 additional minigame prompts were binary or obvious | Bloom *remember/understand* with occasional application | 16 nuanced 4-way scenario questions, all 12 minigame cases rewritten to 4 credible choices; adaptive minigame tier selection; 3 evidence-gated final virtual cases retained |
| Repair Café | Three quiz questions with caricature answers; seven event incidents often had a plainly reckless alternative and the correct answer first and longest | Understand/apply | Three difficult operational questions; 7 incidents with competing staffing/consent/safety trade-offs; correct option placement rotated; first-attempt errors tracked |
| Dubbo Business Field Guide | Six questions with invalid inferences as obvious decoys; guessing often enough | Understand | Six revised questions involving source reliability, contractual title, org authority, employee evidence, conflict management and project capacity; guided and expert tier for every lesson |
| Dubbo E-waste Outreach | Three easy questions contrasting simple permission with clearly unethical collection | Understand | Three realistic multi-variable decisions involving title, data, batteries, capacity and relationships; guided and expert tiers for every lesson |

**Important:** Bloom's taxonomy describes *what thinking is required*, not someone's IQ or a psychometric intelligence level. The earlier content could be answered by someone with little subject knowledge largely through elimination; it would be irresponsible to infer a particular IQ from that. The new questions more commonly require **application, analysis and evaluating evidence** (Bloom levels 3–5), but no representative learner study has calibrated their real difficulty.

## Exact changes applied

- **Content:** 16 laptop mission questions, 12 laptop minigame questions, three Repair Café readiness checks, seven event scenarios (3 plausible actions each), six Dubbo business questions and three sourcing questions rewritten.
- **Challenge expansion:** Nine local-business/outreach topics now have a guided variant plus an expert transfer variant: 18 *additional* questions in `src/data/field-guide-adaptive-challenges.json`.
- **Adaptive selection:** Shared `src/lib/learning/adaptive-difficulty.ts` starts at **Applied judgement (2)**. After two consecutive correct responses, moves up to **Expert transfer (3)**. After two consecutive incorrect responses, steps down to **Guided reasoning (1)**. Mixed pairs do not move the level. The mini games draw next unseen questions at the learner's current challenge tier, avoiding already seen items. The two research courses use the tier when choosing a new question and store it in versioned local Dexie progress.
- **Versioned results:** v2 assessment keys are separate from v1 easier-version credit; old browser data is not silently converted into new mastery. This may look like a new course progress track to returning learners.
- **Quality control:** `assessment-rigour.test.ts` asserts four distinct options, adequate scenario wording, correct-answer position diversity, content coverage, and guards against answer-length shortcuts. Correct-answer option ranks across 43 code-stored knowledge questions at review: **shortest 11, second-shortest 14, second-longest 15, longest 3**. (The three outreach page questions and 12 separate minigame questions have additional manual editorial review and are not included in that 43-question length calculation.)

## Learner experience

**Guided reasoning** should be intellectually respectable — more information or a narrower case, not stupid decoys.  
**Applied judgement** requires selecting what existing evidence supports with realistic constraints.  
**Expert transfer** introduces multiple simultaneous uncertainty and contractual or safety concerns; it is the *challenge tier*, not a claim that passing makes a professional expert.

A well-constructed option may be technically possible yet **not the best decision in the specific scenario**. Explanations distinguish "not best supported" from "impossible". This promotes calibration and discourages rote memorisation.

### Example of harder thinking

Instead of: "A laptop has no lights. Should you check the adapter or replace the CPU?"

Now: "A USB-C laptop has no LEDs; a third-party cable is used, but the wall outlet powers another device. Which controlled observation best reduces uncertainty?" All four options are real diagnostic actions, but only one is the most informative, proportionate first check.

Instead of: "Should you plug in a visibly damaged kettle or refuse?"

Now: "A repair organiser has a competent-sounding volunteer, an RCD, and an offered PAT tester, but the electrical scope, trained competency and insurance remain unconfirmed. Which policy decision is defensible?" The learner must weigh partially effective controls against actual authorisation.

## Remaining assessment limitations / next priorities

1. **First-attempt mastery and distractor quality need empirical trial:** Subject-matter expert review and representative learners should identify ambiguous wording, two defensible answers or items which are still too easy/hard. Automated option-length checks cannot certify distractor quality.
2. **Multiple-choice is not the whole skill:** Add a structured free-form diagnostic report and critique exercise, with a rubric and trained human review, before claiming higher-order competence. Do not let keyword matching pretend to assess expert reasoning.
3. **Repair Café adapts by immediate feedback, but its seven event incidents are currently a fixed sequence.** Add genuinely branching staffing and venue consequences in a future version instead of advertising full adaptive simulation for this course.
4. **Repeated retries can eventually reveal an answer.** Record performance on unfamiliar cases and first attempts separately from completion; don't equate last-attempt success with independent expert competence.
5. **Accessibility and media:** Production build and automated tests do not prove full keyboard, screen-reader, Android or video/audio playback quality. Conduct live walkthroughs and repair failures.
6. **Source validity:** Specialist safety statements need appropriate qualified Australian review before real-world training is relied upon; legal/insurance and data-sanitisation obligations remain situation dependent.
7. **Other legacy courses:** Many general JoshHub topics may still contain low-level Q&A. They are not included in this four-course audit; apply these standards across the catalogue in another verified pass.

## Verification release gates

- Run `npm run test:learning-lab` and strict Next.js build on every learning-content change.
- Verify full live Vercel deployment is **READY** before claiming production completion.
- Open each course on a phone; choose competing distractors, submit an incorrect response, and verify tier movement. Test persistence after refresh and restoration.
- On the Repair Café course, confirm invalid roster/venue combinations do not open the event and correct choices are genuinely not always first.
- On the laptop course, complete all three evidence-gated fictional cases; verify that a correct guess without observations cannot pass.
- Treat expert competence as *unverified* until a suitably designed human-reviewed authentic performance assessment exists.

**Design principle:** A course should demand useful judgement and earn progress through evidence, not reward the learner for recognising that one answer is obviously ridiculous.
