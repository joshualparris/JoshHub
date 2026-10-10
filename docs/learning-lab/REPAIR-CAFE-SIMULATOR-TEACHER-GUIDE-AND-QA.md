# JoshHub Learning Lab — Run Your Own Repair Café

**Status:** interactive training course, not a live booking/volunteer management tool.  
**Version:** 2026-10-11.1  
**Production route:** `/learn/repair-cafe-simulator`  
**Own research:** [Repair Café event and roster operations](https://github.com/joshualparris/DubboEwaste/blob/main/docs/REPAIR-CAFE-MONTHLY-EVENTS-VOLUNTEER-ROSTER-VENUES-2026-10-09.md) and [Farmers Market Pilot](https://github.com/joshualparris/DubboEwaste/blob/main/docs/REPAIR-CAFE-FARMERS-MARKET-PILOT-RESEARCH-2026-10-09.md). A personal Google Drive file titled `Repair Cafe Check-In Checklist V2` was reviewed, including intake, house rules, first aid, accessibility, insurance, PAT testing and rubbish separation. The file's content has not been published or copied to the public repository.

## Learning approach

This is **an operational decision simulator**, not another reading page with a quiz:

| Phase | Learner acts on | Feedback and assessment |
|---|---|---|
| 1. Venue | Three fictional venue offers, restrictions, room capacity, accessibility, and a written-confirmation gate; switches between sewing, computer and bicycle stations on a visual plan | Mismatched categories, missing booking confirmation or inaccessible venue blocks opening. |
| 2. Crew | Seven fictional volunteers with different skills and states: accepted, available, declined. Explicitly request a fictional shift acceptance and assign unique people to roles | No declined or unaccepted volunteer is rosterable. Cannot double-book. Lead, welcome and every open station need coverage. |
| 3. Readiness | Four scenario checklists on insurance, risk, first aid/access, owner consent/intake; three MCQs on acceptance, venue approval and NSW test-and-tag nuance | All checks and correct responses, plus venue/roster/scope, required to open. |
| 4. Event day | Seven timed scenario decisions, community-trust/volunteer-energy/queue-pressure visual feedback, corrective retry | Only a safe, justified resolution advances the event. Unsafe choices prompt specific feedback without normalising hazardous conduct. |
| 5. Debrief | One specific 20+-character reflection; fictional report JSON export | Mastery is seven safe decisions and a meaningful improvement plan, not made-up tonnes of e-waste diverted. |

### Event-day cases

1. Delayed welcome volunteer — slow intake/coordinate a safe cover.
2. Torn school shirt — owner-present, one-item rule, realistic skills/scope.
3. Exposed mains lead on kettle — stop, don't energise, appropriate referral.
4. Laptop and password left behind — refuse unsafe custody, protect visitor data.
5. Queue overload — communicate capacity, wait and fair cut-offs.
6. Spill across accessible exit — isolate and restore accessible circulation.
7. Close-out — owner handover, minimal data, outcomes, volunteer care and learning.

All cases, volunteer biographies, venues, approvals, prices and performance metrics are **fictional**. No real 2027 Repair Café date, venue, volunteer or service offer is implied.

## Research and technical correctness

**Repair Café International** describes a non-commercial, volunteer-led repair-together model. Its house rules say one item per person initially, no guarantee of repairs, and visitors responsible for removing items; general house rules are not a substitute for Australian law or tailored policies.
- [About Repair Café](https://www.repaircafe.org/en/about/)
- [International house rules](https://www.repaircafe.org/en/house-rules/)
- [Starter kit overview](https://www.repaircafe.org/en/join/start-your-own/)

**NSW safety and volunteering:** The simulator deliberately does *not* teach that every item universally requires PAT testing. SafeWork NSW describes workplace-specific circumstances and competent people, and additional requirements depending on equipment/hazards. Unsafe electrical items should be isolated. A training simulation cannot determine actual insurance policy scope or licence requirements.
- [SafeWork NSW: electrical inspection and testing](https://www.safework.nsw.gov.au/hazards-a-z/electrical-and-power/electrical-inspection-and-testing)
- [SafeWork NSW: electrical work](https://www.safework.nsw.gov.au/hazards-a-z/electrical-and-power/electrical-work)
- [NSW Government event volunteer guidance](https://www.nsw.gov.au/departments-and-agencies/premiers-department/community-engagement/event-starter-guide/volunteers)

### Media and rights

- Original HTML/CSS floor-plan diagram automatically reflects enabled stations; clearly marked illustrative, not a valid real emergency plan.
- Real Repair Café photograph from Trier, by **RaMa2016**, 28 November 2015, **CC BY-SA 4.0**, unmodified. [File and licence](https://commons.wikimedia.org/wiki/File:Repair_Caf%C3%A9_Trier_Reparatur.jpg); externally served by Wikimedia Commons.
- [15 years of Repair Café documentary](https://www.repaircafe.org/en/anniversary-documentary-on-15-years-of-repair-cafe/) on Repair Café International's official page; publisher states English subtitles available.
- [Restart Radio](https://therestartproject.org/podcast/), authentic podcast library about repair and community.
- Optional locally synthesised narration (Web Speech API). It is not a recorded podcast. Full text remains visible.
- External content is linked and attributed; playback on every device and subtitle accuracy remain untested.

## Technical architecture

- Route: `src/app/learn/repair-cafe-simulator/page.tsx`
- UI: `src/components/learn/RepairCafeSimulator.tsx`
- Curriculum and fictional source data: `src/data/repair-cafe-simulator.json`
- Logic and restore sanitisation: `src/lib/learning/repair-cafe-logic.ts`
- Test suites: `src/lib/learning/repair-cafe-logic.test.ts`, `repair-cafe-content.test.ts`
- Uses versioned localStorage at `joshhub:repair-cafe-simulator:v1`. No server APIs, connection to a real volunteer database, cookies, publishing rights or real outreach actions.
- All fictional decisions are exported as JSON locally if the user elects. No children's names, contact details or other real personal information in the scenarios.

## Acceptance and QA checklist

| Check | Status and method |
|---|---|
| Three venue choices with restrictions | Logic unit tests |
| Written confirmation and accessibility block unsafe launch | Logic unit tests |
| Skill matching, separate acceptance, single assignment | Logic unit tests |
| Four checks and three quiz gates | Logic unit tests |
| Seven unique incident episodes and one safe pathway each | Data/logic unit tests |
| Final reflection and simulated-report gate | Logic unit tests |
| Lesson route and TypeScript compile | Production Next.js/Vercel build |
| Keyboard accessibility, mobile breakpoint layout | Source uses semantic controls; **manual QA needed** |
| Verify actual film/podcast playback on Android | Publisher pages checked; **manual QA needed** |
| Simulated progress resumes after browser restart | LocalStorage source checked; **manual QA needed** |
| Expert / experienced Repair Café leader review | **Outstanding** |
| Real operational suitability | **Not claimed** |

A successful production build is necessary but **not sufficient** to claim the course fully tested. The next important step is a real signed-in Android browser walkthrough, including a fictional full event, invalid roster, blocked venue and recovery after reload.

## Quality improvements for next iteration

1. Have an experienced coordinator validate case realism and the Australian-specific event risk wording.
2. Add a short illustrated visitor-intake microgame with sorting/tagging, if not duplicating the scenario choice exercise.
3. Consider optional difficulty levels (beginner with visible prompts; advanced with hidden safety checklist), without competitive streak pressure.
4. Check Android screen readers, speech controls and external media; repair any actual usability problems.
5. If users want cross-device progress, implement authenticated progress sync with privacy and migration design; don't imply localStorage is synced.
6. Only connect to the real volunteer roster when expressly requested, and never transfer fake training people or events to production.

**The core design principle:** successful local community repair is primarily about *people, consent, safety, trust and appropriate scope*, not making the item count as large as possible.
