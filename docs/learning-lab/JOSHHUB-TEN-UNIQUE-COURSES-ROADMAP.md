# JoshHub Learning Lab — Ten Unique Learning Experiences
**Version:** 2026-10-11.1 · **Status:** Architectural plan, not ten completed modules
**Owner:** JoshHub production repository `joshualparris/JoshHub`
**Research basis:** GitHub/Drive source audit, representative source reads; vendor teaching approaches and cognitive-science evidence.

## Why this exists
Build a *platform of different learning environments*, not ten copies of a reading page + multiple-choice quiz. Shared foundation: provenance, accessibility, saved/resumable progress, consent-aware privacy and genuine evidence of learning. Distinct domain interaction and outcomes per course.

## Learning principles we will follow
1. **Khan Academy:** Use assessment evidence for mastery and allow retries; completion != time on page.
2. **Duolingo:** Very short authentic practices and adaptive review where repetition helps; avoid compulsory streaks or manipulative rewards.
3. **LinkedIn Learning:** Show expert explanations and worked examples followed by job-relevant exercises.
4. **PhET:** Interactive what-if experiments and visible consequences for subjects that support simulation.
5. **Research evidence:** retrieval practice, feedback, spacing, interleaving and useful worked examples rather than unsupported learning-style labels.
6. **Humane curriculum:** Faith/reflection/children's play should not be graded like IT diagnostics. Avoid forced gamification.

## Catalogue — distinct experience per subject
| ID | Course | Core interaction | Outcome | Content starting point |
|---|---|---|---|---|
| 1 | The Dead Laptop Detective | Virtual repair workbench | Evidence-based fault isolation + safe escalation | DubboEwaste schematics library; Drive device indexes |
| 2 | Run Your Own Repair Café | Event management simulation | Safe event/rostering/referral decisions | DubboEwaste Repair Café SOP; Drive check-in checklist |
| 3 | Lost in the Australian Bush | Map-based expedition | Choose a safe route and justify decisions | Drive bushwalking/outdoor education research |
| 4 | Journey Through the Psalms | Audio-first annotated journal | Contextual comprehension and personal reflection (unscored) | FaithHub; Drive Psalms and Bible reflection documents |
| 5 | The Family History Detective | Evidence board and archive puzzles | Source-backed mini family tree | Drive genealogical reports; private tree |
| 6 | Play Piano by Ear and Sight | Live MIDI studio | Demonstrated note, rhythm and listening skills | ParrisPiano MIDI tutor |
| 7 | The Household Money Lab | Interactive cash-flow sandbox | Build a resilient fictional budget | ParrisBudgetApp; Drive financial literacy research |
| 8 | The AI Education Ethics Council | Deliberative multi-role dialogue | Defensible school AI use policy | Drive AI education inquiry and teaching reports |
| 9 | The Worldbuilder's Atlas | Explorable interactive fantasy atlas | Coherent maps, cultures, trade and story conflict | realms-atlas; AshFallen |
| 10 | The Sound Garden | Play-based phonics garden | Recognise/blend target phonemes over contexts | SylviePhonetics EYLF mapping |

## Exact development workflow for every module
**1. Source audit:** Identify actual repo files / Drive document IDs, licence, provenance, version, evidence level, conflicting content. Build a source manifest. Never expose private Drive records or redistribute copyrighted manuals without permission.
**2. Competencies:** Break target into 5–20 observable competencies. Set starting checks, formative activities, final transfer/creation assessment.
**3. Interaction grammar:** Choose a single *dominant* interaction fitting the subject (virtual circuit test, roster board, map, reflection journal, evidence board, MIDI, sandbox, debate, world map, phonics play). Shared UI may handle navigation and access, but not homogenise content.
**4. Instructional variety:** Short annotated reading, meaningful images and diagrams, optional captioned verified videos, accessible audio/transcripts, prompts for physical practice or authentic work, feedback tied to why.
**5. Assessment design:** Require learner to use evidence, not just guess. Explain wrong answers, permit retries, add spaced retrieval where relevant, do not mark mastery just for opening media.
**6. Safety, rights and permissions:** Protect personally identifying materials, children's work, medical/financial/family records and employer confidential information. Honour source copyright. No real unsafe electrical procedures.
**7. Build and integrate:** Implement separate route and isolated data/engine. Store progress safely, version state and migrations, link in /learn. Mobile-first, touch and keyboard accessible; captions, transcripts and alt text.
**8. QA and publish:** Unit tests for logic; build/TS strict; deployment READY; test phone small widths, keyboard, failure states, reload persistence, no misleading dead external links. Build READY is not a substitute for logged-in E2E tests.
**9. Review:** Expert check for high-stakes or specialist skills; collect user feedback and fix misconceptions. Periodically re-verify external links and stale sources.

## Assessment and privacy matrix
| Course | Required performance | Privacy | Need an expert review? |
|---|---|---|---|
| The Dead Laptop Detective | 8 missions, 3 unseen fault cases → Evidence-based fault isolation + safe escalation | Simulation/test records only by default | Yes, before claiming professional competence |
| Run Your Own Repair Café | 5 events, one full event day → Safe event/rostering/referral decisions | Simulation/test records only by default | Yes, before claiming professional competence |
| Lost in the Australian Bush | 6 expeditions → Choose a safe route and justify decisions | Simulation/test records only by default | Yes, before claiming professional competence |
| Journey Through the Psalms | 12 Psalms → Contextual comprehension and personal reflection (unscored) | Private by default; opt-in only | Recommended |
| The Family History Detective | 5 historical mysteries → Source-backed mini family tree | Private by default; opt-in only | Recommended |
| Play Piano by Ear and Sight | 20 graded exercises → Demonstrated note, rhythm and listening skills | Simulation/test records only by default | Recommended |
| The Household Money Lab | 7 scenarios → Build a resilient fictional budget | Private by default; opt-in only | Recommended |
| The AI Education Ethics Council | 5 hearings → Defensible school AI use policy | Simulation/test records only by default | Yes, before claiming professional competence |
| The Worldbuilder's Atlas | 8 chapters → Coherent maps, cultures, trade and story conflict | Simulation/test records only by default | Recommended |
| The Sound Garden | 12 child-led sessions → Recognise/blend target phonemes over contexts | Private by default; opt-in only | Yes, before claiming professional competence |

## Module 1 specification: Dead Laptop Detective
- **Promise:** Diagnose simulated no-power/no-POST/no-video/no-boot symptoms without touching unsafe hardware.
- **8 missions:** 1 Intake & safety; 2 The four failure categories; 3 Board anatomy & PCB identity; 4 Virtual multimeter and safe tests; 5 No-power detective; 6 No-video detective; 7 No-boot detective; 8 Unseen cases + evidence.
- **Core experience:** clickable labelled virtual board; select tool/tests; receive different readings per fault case; keep a notebook of observations; commit fault hypothesis based on evidence; targeted feedback.
- **Assessment:** three unseen simulated cases each require relevant diagnostic observations, a fault-family decision, and correct evidence. Full mastery only after all three, with free deliberate retries.
- **Media:** original SVG annotated workstation, verified Commons image with attribution and fallback source page, real vendor teardown video links with transcripts offered where available; podcast link and original accessible narrated 'bench briefing' via browser speech synthesis (not an externally recorded podcast).
- **Constraints:** all voltage readings clearly simulated; no encouragement to probe mains or swollen batteries; actual work follows exact model service manuals, disconnection/ESD and trained supervision.
- **Reference sources:** iFixit laptop troubleshooting, Lenovo L480 user guide and official removal videos, Dell startup categories, plus local schematic library and Drive source index.
- **Progress:** local versioned storage by default, no fabricated syncing, expandable as a cross-device account feature.
- **QA gates:** mission navigation, test outcomes, evidence-gated decisions, accessibility and screen sizes, persistence, external link review, Vercel READY.

## Build sequence
1. Deliver fully realised *Dead Laptop Detective* 8-mission lab and validate.
2. Prototype Repair Café simulator on real policies but use fictional visitors and volunteers.
3. Extract real-time MIDI tutor into music course.
4. Prove quiet, unscored Scripture module.
5. Pick next modules based on measured learning and maintenance capacity, not only visual novelty.

## Audit snapshots and links
- https://github.com/joshualparris/DubboEwaste/blob/main/docs/DEVICE-SCHEMATICS-LIBRARY.md
- https://github.com/joshualparris/DubboEwaste/blob/main/docs/REPAIR-CAFE-MONTHLY-EVENTS-VOLUNTEER-ROSTER-VENUES-2026-10-09.md
- https://github.com/Parris-Tech-Services/ParrisPiano
- https://github.com/Parris-Tech-Services/FaithHub
- https://github.com/joshualparris/SylviePhonetics
- https://github.com/joshualparris/realms-atlas
- https://github.com/Parris-Tech-Services/ParrisBudgetApp
- https://github.com/Parris-Tech-Services/ResearchAtlas
- https://www.ifixit.com/Troubleshooting/PC_Laptop/Laptop+Will+Not+Turn+On/505262
- https://download.lenovo.com/pccbbs/mobiles_pdf/l480_l580_ug_en.pdf
- https://www.dell.com/support/kbdoc/en-us/000125609/resolve-no-power-no-post-no-boot-or-no-video-issues-with-your-dell-computer
