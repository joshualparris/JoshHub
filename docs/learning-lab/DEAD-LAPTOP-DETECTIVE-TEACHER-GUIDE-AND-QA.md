# The Dead Laptop Detective — teacher guide, source register and QA specification

Version: 2026-10-11.2 · Module route: `/learn/dead-laptop-detective`
**Implementation:** `src/components/learn/DeadLaptopLab.tsx`, `DetectiveMiniGames.tsx`, `src/data/dead-laptop-detective.json`, `src/lib/learning/dead-laptop-logic.ts`
**Audience:** Curious novice → competent *simulated* fault-finding reasoning. This does **not** certify live electrical service or data-erasure skills.

## A. Observable learning outcomes

1. Distinguish no power, no POST, no video and no boot using observable signals.
2. Practise safe intake, battery hazard escalation, owner permission and data-awareness.
3. Explain the functions of power input, power regulators, CPU cooling, RAM, SSD, battery and display connector.
4. Know the difference between service manual, electrical schematic and BoardView; verify exact PCB silkscreen and revision.
5. Describe what a virtual meter reading does and does not establish; use isolated/unpowered resistance principles conceptually.
6. Design a least-invasive fault-isolation sequence and record what actually happened.
7. Diagnose three fictional unseen case variants with two required independent observations and the best-supported fault *family*.
8. Identify uncertainty and escalation points rather than claiming a component replacement on insufficient evidence.

## B. Mission and game map

| Mission | Reading / scaffold | Practical interaction | Evidence of understanding |
|---|---|---|---|
| 1 Intake desk | Ownership, data, battery risks, power isolation | Six-case Safety or Stop? game | Scenario + knowledge check |
| 2 Failure classes | Manufacturer fault categories and LED caveats | Six-case Symptom Sorter game | Stage-of-failure classification |
| 3 Map the machine | Component relationships + PCB identity | Seven interactive circuit-board hotspots | Correct board-identification reasoning |
| 4 Simulated meter | DC voltage vs resistance/continuity | Virtual meter mode selector + test readings | Interpret reading without jumping to replacement |
| 5 Power path | Low-invasive power isolation | External power substitution case tests | Supported adapter/path hypothesis |
| 6 Missing display | External screen and flashlight indicators | Interactive video reasoning + embedded teardown | Identify illumination path with uncertainty |
| 7 Boot handoff | Firmware, storage and data preservation | Virtual BIOS/USB/SSD observations | Storage-path hypothesis |
| 8 Final casework | Unseen clinical-style case patterns | Three evidence-gated fault cases + notebook | All three case verdicts + both questions |

**The three final cases** are fictional and target different fault families: external adapter/cable, LCD/backlight, and internal storage detection. No precise replacement component is proven. The course allows review and retry without penalties. Mission completion requires correct answers, with all three cases additionally required for final mastery.

## C. Content research — high-authority sources

- **Dell manufacturer taxonomy:** [Resolve No Power, No POST, No Boot or No Video](https://www.dell.com/support/kbdoc/en-us/000125609/resolve-no-power-no-post-no-boot-or-no-video-issues-with-your-dell-computer). Four symptom categories are manufacturer-described; exact LED patterns remain model specific. Reviewed 11 October 2026.
- **Lenovo:** [ThinkPad L480/L580 User Guide](https://download.lenovo.com/pccbbs/mobiles_pdf/l480_l580_ug_en.pdf). Disabling internal battery and reading official service procedures is a prerequisite where specified. Reviewed 11 October 2026.
- **Lenovo videos:** [L480 removal/replacement catalogue](https://support.lenovo.com/pr/en/solutions/HT511079). Real vendor walkthroughs are linked rather than copied. Reviewed 11 October 2026.
- **iFixit:** [Laptop Won't Turn On](https://www.ifixit.com/Troubleshooting/PC_Laptop/Laptop+Will+Not+Turn+On/505262), practical symptom isolation. Reviewed 11 October 2026.
- **User's local research:** [DubboEwaste schematics library](https://github.com/joshualparris/DubboEwaste/blob/main/docs/DEVICE-SCHEMATICS-LIBRARY.md). Retail family is not equivalent to exact PCB revision. Reviewed current repository.
- **Google Drive (private):** *Device Schematics & Repair Library – Master Index* and *Current Fleet Board-Level Schematic Match Audit (7 Oct 2026)* were identified as original source material. The course uses non-private method lessons; it does **not** publish personal inventory data, store a copy of proprietary manuals or expose private Drive IDs.

## D. Verified media, provenance and permissions

| Media | Source and rights | Use |
|---|---|---|
| Annotated virtual board | Original JSX/SVG-style CSS illustration in JoshHub | Fictional component exploration; not physical board reference |
| Lenovo X220 motherboard with RAM | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Lenovo_ThinkPad_X220_Motherboard_(FRU_04W3286)_with_16GB_Crucial_RAM.jpg) — Siarhei Besarab / Siarhei V; CC BY-SA 4.0; unmodified | Illustrate actual component appearance, clearly distinguished from L480 |
| Same X220 board with empty slots | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Lenovo_ThinkPad_X220_Motherboard_(FRU_04W3286)_with_empty_RAM_slots.jpg) — same author, CC BY-SA 4.0; unmodified | Before/after comparison |
| L480 RAM video | [TechNTechie, YouTube](https://www.youtube.com/watch?v=DrIuj47bqX0) | Embedded instruction with direct fallback link; externally hosted |
| L480 service videos | [Lenovo official](https://support.lenovo.com/pr/en/solutions/HT511079) | Vendor instructional reference |
| L480 alternative teardown | [Notebook-Doktor on YouTube](https://www.youtube.com/watch?v=wfi_3AAOUxI) | Optional real hardware example; verify language and captions yourself |
| Restart Radio episode | [Hackney Fixers laptop repair and reuse](https://podcasts.apple.com/us/podcast/restart-radio-hackney-fixers-laptop-repair-and-reuse/id983603182?i=1000490761002) | Community repair and reuse context, 29 min |
| Original audio bench briefing | Browser Web Speech API | Locally synthesised narration; transcript on page; **not** a recorded podcast |

Externally embedded media may be blocked by user privacy settings, network rules or content provider. Every clip has an explicit original link. The Commons photo has a fallback to its licence-bearing original page. We don't claim to have professionally approved every statement in third-party media.

## E. Testing matrix and release gate

| Test | Automated | Manual check still needed |
|---|---|---|
| 8 missions, question answer indices, source linkage | Vitest content tests | Editorial read on phone |
| 3 distinct cases, each test has a meaningful fictional observation | Vitest content tests | Confirm notebook renders every observation |
| Can't guess without required observations | Vitest logic tests | Try choosing correct answer before running tests |
| Can't cite unobserved tests | Vitest logic tests | Try selecting notebook evidence before test |
| Wrong diagnosis rejected and justified one accepted | Vitest logic tests | Test all three cases in UI |
| Final completion gated by all cases | Vitest logic tests | Verify button behaviour with 2/3 then 3/3 |
| Strict TS and static page build | Vercel build; GitHub CI workflow | Screen rendering and keyboard interaction |
| 360px and tablet layouts | Design review in source only | **Not verified in real browser** |
| LocalStorage load/save, blocked storage and reset | Graceful code paths | **Not yet click-tested across reloads and devices** |
| YouTube playback, caption quality and TTS speech | Links researched; code integrated | **External playback not independently verified** |
| Screen reader and WCAG conformance | Semantic labels included | **No independent assistive technology audit yet** |

Production builds are not proof of all interactions. Do not mark browser-only rows as passed until actually checked. All unit tests run before every `npm run build`, and GitHub Actions also defines the same quality gate on learning-code changes.

## F. Safety and quality boundaries

- No real high-voltage, mains or live-board probing instructions or simulated activities requiring physical hardware.
- All numerical readings and device stories are fictional; never present them as actual Lenovo L480 readings.
- Suspected swollen/damaged lithium batteries are stop conditions, not beginner repairs.
- Data-bearing devices require authorisation, data-preservation planning and lawful chain of custody.
- Real hardware training requires manufacturer-specific procedures, correct tools, training and appropriate supervision.
- Specialist technical reviewer sign-off is still needed before claiming this module teaches *professional service competence*.
- A full UI, keyboard, screen-reader and media playback check remains a final release-quality step.

## G. Post-release improvement backlog

1. Conduct manual touch and keyboard E2E tests on Samsung Android and desktop Chrome; fix issues rather than relying on the build result.
2. Add a spaced-review queue that revisits the four fault categories after 1/7/30 days; never punish a missed interval.
3. Add genuine expert-approved training explanations only after consent and qualified review; keep attribution and dated change notes.
4. Add more proven photo assets with per-image captions, rather than generic image searches.
5. Add learner-friendly export/restore of progress if cross-device support is desired. Current state remains browser local.
6. Log anonymised error patterns only with consent; do not capture device secrets or personal donor data.

**Acceptance rule:** A real learner can open the route, complete every mission, manipulate the board, perform virtual tests, solve the three evidence-gated cases, view properly attributed photos, open real media, resume progress, and understand precisely which skills the simulation does and does not establish.
