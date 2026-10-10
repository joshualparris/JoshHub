# LMS comparison and learning-experience design brief
Reviewed 11 October 2026. Prepared for JoshHub, Research Atlas, Dubbo Circular Learning, DCSPD and related reference libraries.

## Bottom line
Do not treat LMS star ratings as evidence of learning effectiveness. Treat **retrieval practice**, **distributed review**, **timely informative feedback**, **worked examples**, **authentic application**, and **accessible, coherent multimedia** as separate design requirements. Minimise navigation friction and preserve existing progress and roles.

## Evidence for learning design (not vendor ratings)
- Dunlosky et al. (2013), *Improving Students' Learning With Effective Learning Techniques*: practice testing and distributed practice receive high-utility ratings; self-explanation and interleaving have more conditional evidence. https://www.psychologicalscience.org/journals/pspi/1529100612453266/
- Agarwal et al. (2021), *Retrieval Practice Consistently Benefits Student Learning*: review of applied classroom work. https://doi.org/10.1007/s10648-021-09595-9
- Education Endowment Foundation (2021), *Cognitive science approaches in the classroom*: systematic evidence/practice review and implementation limits. https://educationendowmentfoundation.org.uk/education-evidence/evidence-reviews/cognitive-science-approaches-in-the-classroom/
- Fiorella & Mayer (2021), instructional video design: coherence, segmentation, signaling and meaningful retrieval/self-explanation activity matter more than decorative video. https://doi.org/10.1016/j.jarmac.2021.03.007

## Feature comparison: lessons to borrow, not platform rankings
| Platform | Verified vendor-documented strengths | Adapt for JoshHub or volunteer academy | Limit |
| --- | --- | --- | --- |
| TalentLMS | Learning paths, assessments, scheduled reports, role/group separation. [Features](https://www.talentlms.com/features); [Reporting](https://help.talentlms.com/hc/en-us/articles/9652242394780-What-types-of-reports-are-available) | Short course structure, one clear next action, supervisor learning-matrix without exposing private operational records | Vendor features are not proof of better retention. |
| Canvas (Instructure) | Modules, quizzes, learning outcomes; score-dependent Mastery Paths. [Basics](https://community.instructure.com/en/kb/articles/662716-what-is-canvas); [Mastery Paths](https://community.instructure.com/en/kb/articles/662760-unknown) | Route learners to extra support or harder practice based on demonstrated understanding, not self-declared completion | Conditional paths require validated questions and accessible alternatives. |
| 360Learning | Emphasis on collaborative / peer-created workplace learning; useful model to examine. [Official](https://360learning.com/) | Permit trained volunteers to suggest corrections and share reviewed practical examples | Verify moderation, approval, factual accuracy, privacy and attribution before publishing peer content. |
| Moodle | Modular activity and course progression model. [Docs](https://docs.moodle.org/) | Distinct reading, practice, quiz, feedback and completion states | Adding features without a clear learning objective creates friction. |

### User-review signals are separate
As a dated example of customer *experience* data, G2 displayed TalentLMS at 4.6/5 across 750 reviews (G2 AI page, May 2026). https://ai.g2.com/product/talentlms . Customer ratings have selection bias, change over time and **must never be converted to claims about learning gains**. Equivalent contemporaneous, independently checked data for Canvas, 360Learning and Moodle was not available during this pass; no fabricated head-to-head rankings.

## Recommended default learning cycle
1. Set one observable objective and prerequisite; ask an opening question.
2. Explain one concept concisely, using one genuinely explanatory diagram, photo or clip with working original link and text alternative.
3. Ask for an answer from memory **before showing the saved answer** (free response before multiple-choice when practical).
4. Reveal the model answer, explain *why*, show a useful counterexample and let learner retry.
5. Perform one safe real-world task or scenario; require reflection/verification when needed.
6. Return for reviews after increasing intervals; prioritise overdue/incorrect knowledge, not streaks.
7. On the next visit, open at “Continue learning” or “Review due”; keep a readable record of what was learned.

## Multimedia editorial rules
- Media must have a stated teaching purpose and question, genuine provider/source, checked playback, and available accessible text alternative. No autoplay and no decorative video dumping.
- Source claims and permissions separately: educational illustration does not certify electrical skills or data-sanitisation competence.
- Prefer direct original resource URLs when embedded YouTube blocks break; never label an external podcast a locally generated audio file.
- Do not infer a real video, transcript or podcast exists from a keyword-search result. Mark missing/unverified assets as such.
- Review link availability before publishing; note accessed/reviewed date, language and caption status.

## Project-specific status at review
- **JoshHub**: field guide already has saved per-lesson completion; new recall-first checks and browser-local spaced reviews added 11 October 2026. Reviews are not synchronised across devices; retain this disclosure.
- **DubboEwaste**: role-protected Supabase enrolments, practical supervisor reviews and curated reading/media already exist; added inline voluntary recall → reveal → compare exercises. Acknowledging media viewing is *not* a competency assessment.
- **ResearchAtlas**: gem cards already had a spaced schedule, but showed the saved note before recall; PR introduces recall-before-reveal.
- **DCSPD**: already had Leitner review scheduling; PR disables review rating before answer reveal. Separate CI security audit must be resolved without suppressing advisories.
- **DCSCompanion / UpskillApp / CircularEconomyDubbo**: different roles. Do not duplicate entire LMS into a reference library, training planner or public landing page. Link to the appropriate canonical learning experience instead.

## Evaluation checklist
Measure (with consent and minimal personal data): voluntary session success, completing an authentic scenario, delayed retrieval accuracy (1 week / 1 month), incorrect item retries, mobile accessibility and broken media links. Completion counts, watch time, badges and customer star ratings are engagement proxies, not demonstrated retention. Never make protected volunteer submission data public or push identifiable analytics to GitHub.

## Known unfinished items
- Implement safe cross-device review syncing only after access-control and RLS review; otherwise local-first is intentional.
- Verify every existing linked video/audio resource **in the rendered app** for playback, language, captions and learner task relevance.
- Link accessibility checks with actual keyboard/mobile testing; inspect PR build and CI results before merging.
- ResearchAtlas production project's GitHub source mapping needs verification, because the attempted Vercel preview deploy could not resolve its Parris-Tech-Services source.
- Repair outstanding high/critical npm dependency advisories (especially DCSPD Next.js) before treating security as passed.

This document distinguishes scientific evidence, vendor features, subjective product reviews and repo-observed implementation; it is not a claim of independent measured learning outcomes.
