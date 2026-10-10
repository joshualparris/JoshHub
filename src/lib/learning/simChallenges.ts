import type { Challenge } from "./adaptive";
/** Applied simulated decisions; never infer competence from length or selection alone. */
export const simChallenges = {
  "laptop": [
    {
      "id": "laptop:0",
      "level": 1,
      "question": "The vendor logo appears and a boot-device error follows. What does that establish, and what remains unknown?",
      "options": [
        "Firmware shows a boot-device error; drive recognition and boot handoff remain unresolved.",
        "A successful power-on test; follow up with a Windows repair environment to confirm filesystem health.",
        "A partial POST; the next action is to treat the OS as corrupt until a drive is visible."
      ],
      "answer": 0,
      "explanation": "A logo and firmware-generated storage error show progress past complete no-power and no-video, but they do not isolate drive, connection or OS state."
    },
    {
      "id": "laptop:1",
      "level": 1,
      "question": "A manufacturer-specific light pattern repeats on startup, but your generic code chart is for another model. How should it affect diagnosis?",
      "options": [
        "Document the sequence as a possible hardware clue and compare to similar models before ordering parts.",
        "Record the exact blink pattern, then verify its meaning against the model-specific service manual.",
        "Use the code to prioritise replacing a likely faulty component, confirming later with firmware diagnostics."
      ],
      "answer": 1,
      "explanation": "Diagnostic blink codes differ by model and platform; analogous guides are hypotheses, not verified interpretations."
    },
    {
      "id": "laptop:2",
      "level": 2,
      "question": "BIOS does not list the original SSD. A known-good USB boots repeatedly, and the owner wants files preserved. Which next plan reduces uncertainty with least data risk?",
      "options": [
        "Reseat the original SSD before documenting settings; intermittent detection is commonly mechanical.",
        "Run OS recovery from USB against the original volume before substituting hardware.",
        "Inspect firmware mode and connector, then test a spare without altering the original drive."
      ],
      "answer": 2,
      "explanation": "A working USB does not verify SSD or connector health. Data preservation and documented, reversible isolation have priority."
    },
    {
      "id": "laptop:3",
      "level": 2,
      "question": "External HDMI works, while angled light shows a faint image on the internal LCD. What hypothesis is strongest without ordering parts?",
      "options": [
        "An internal illumination-path issue, still to be isolated to panel, supply or cable.",
        "An eDP data failure, because external output routes through a separate channel.",
        "An internal panel logic fault, because the faint image proves the backlight supply is stable."
      ],
      "answer": 0,
      "explanation": "Faint image suggests an illumination problem without proving which cable, panel component or controller has failed."
    },
    {
      "id": "laptop:4",
      "level": 2,
      "question": "The laptop shuts down under sustained load but operates cold at idle. Both power and CPU temperature were uncontrolled. What should you investigate next?",
      "options": [
        "Measure thermal behaviour under reproducible loading before assuming it is heat-related.",
        "Control thermal and supply conditions before attributing the shutdown to a specific cause.",
        "Prioritise battery-cycle tests, because unstable packs commonly cause load-related shutdown."
      ],
      "answer": 1,
      "explanation": "Correlation with load alone cannot differentiate heat from power limits. Control competing variables first."
    },
    {
      "id": "laptop:5",
      "level": 2,
      "question": "The adapter reads 19.4V unloaded and 0.6V when connected to a verified compatible load. What is the most defensible next test?",
      "options": [
        "Measure the adapter's open-circuit output a second time using a different meter range.",
        "Inspect the laptop charging socket for heat before concluding anything about the adapter.",
        "Check an alternate known-good supply at the same load and verify the original test configuration."
      ],
      "answer": 2,
      "explanation": "Voltage collapse under a controlled load implicates supply path; matched comparison is more informative than another unloaded reading."
    },
    {
      "id": "laptop:6",
      "level": 2,
      "question": "A RAM reseat preceded one successful boot, but hinge movement later triggered repeated failures. What diagnosis note is scientifically sound?",
      "options": [
        "Document the movement-dependent intermittence; one successful boot isn't a repair.",
        "Prioritise hinge-cable replacement before more tests because the failure changes with movement.",
        "Record a suspected memory seating issue and schedule a longer memory stress test."
      ],
      "answer": 0,
      "explanation": "One improvement is correlation not proof; movement introduces other electrical and mechanical possibilities."
    },
    {
      "id": "laptop:7",
      "level": 3,
      "question": "The internal LCD flickers when the hinge moves. External HDMI is stable; the spare panel is not compatible. What is the safest informative plan?",
      "options": [
        "Compare the incompatible panel briefly under low brightness to isolate the fault family.",
        "Record hinge dependence and inspect the eDP cable path safely before compatible substitution.",
        "Swap the motherboard display connector first, leaving the panel untested until a part arrives."
      ],
      "answer": 1,
      "explanation": "Model-matched, isolated cable and hinge-path checks are safer and more interpretable than incompatible substitutions."
    },
    {
      "id": "laptop:8",
      "level": 3,
      "question": "A refurbished laptop still has third-party MDM enrolment and incomplete storage erasure records. The current holder has physical custody. What is the release decision?",
      "options": [
        "Approve reuse with a restricted local account if network enrolment can be disabled.",
        "Issue it after replacing the SSD; the old MDM registration can be addressed after delivery.",
        "Hold for approved MDM removal and verified authorised storage sanitisation before reuse."
      ],
      "answer": 2,
      "explanation": "Ownership and management controls must be legitimately removed, and data processing documented, before a device is released."
    },
    {
      "id": "laptop:9",
      "level": 3,
      "question": "Simulated input voltage is normal but regulator output is absent, with intermittent status LEDs. You do not have exact board records. What is the strongest report?",
      "options": [
        "Suspect a regulator-stage issue, but the two observed voltage points do not establish the cause.",
        "Describe the main buck regulator as failed based on its output and schedule replacement.",
        "Focus on the embedded controller firmware, because intermittent LEDs make regulator data unreliable."
      ],
      "answer": 0,
      "explanation": "A missing rail is a symptom; surrounding power enable, load and component evidence remain absent."
    },
    {
      "id": "laptop:10",
      "level": 3,
      "question": "Five laptops show four successful cold starts and two successful warm starts with mixed chargers and batteries. What can you responsibly report?",
      "options": [
        "An established temperature-sensitive motherboard failure, provided test dates are documented.",
        "Report inconsistent warm boots; mixed batteries and adapters require controlled retests.",
        "A 40% chance of warm boot failure across this laptop family, based on ten attempts."
      ],
      "answer": 1,
      "explanation": "Uncontrolled conditions prevent causal or population-level reliability claims."
    },
    {
      "id": "laptop:11",
      "level": 3,
      "question": "A device boots reliably but reports storage health warnings and battery wear; the replacement panel has not been validated. Is it ready for resale?",
      "options": [
        "Sell as fully working with a short warranty, and fix any remaining faults if a buyer returns it.",
        "Offer conditional resale with disclosed faults, since basic functionality is proven.",
        "Hold normal sale claims until storage, battery and display findings are resolved."
      ],
      "answer": 2,
      "explanation": "A successful boot does not prove durable performance, safety or a verified display replacement."
    }
  ],
  "cafe": [
    {
      "id": "cafe:0",
      "level": 1,
      "question": "A hall host says the group could probably use the space and offers a provisional Saturday hold. What is the defensible publicity decision?",
      "options": [
        "Secure the date and approved activity scope in writing before advertising the event as confirmed.",
        "Publish the event with a venue-to-be-confirmed notice, since an expression of interest is enough for planning.",
        "Publish a tentative date with no venue name and seek a written activity-specific booking before final publicity."
      ],
      "answer": 0,
      "explanation": "A provisional hold may support planning, but publicity shouldn't imply a definite venue and approved activities without confirmation."
    },
    {
      "id": "cafe:1",
      "level": 1,
      "question": "Jules listed Saturday availability but hasn't accepted the offered bike station. What should the event desk record?",
      "options": [
        "Accepted if the volunteer's prior attendance demonstrates reliable participation.",
        "Record the person as available, but not confirmed until a specific shift is accepted.",
        "Provisional shift assigned and counted towards safe coverage, with confirmation due on Friday."
      ],
      "answer": 1,
      "explanation": "Availability is distinct from a specific accepted shift; public scope cannot rely on unconfirmed coverage."
    },
    {
      "id": "cafe:2",
      "level": 2,
      "question": "The hall permits sewing and laptop guidance but explicitly excludes bicycles. Two bicycle volunteers are confirmed. What repair categories may you advertise?",
      "options": [
        "List all categories and turn away bicycles only if the venue objects on the day.",
        "Advertise bicycle repairs conditional on an additional host check at opening.",
        "Advertise only approved, staffed categories; seek separate approval for bicycles."
      ],
      "answer": 2,
      "explanation": "Public scope requires both an approved venue and appropriate volunteer coverage. More volunteers can't override venue restrictions."
    },
    {
      "id": "cafe:3",
      "level": 2,
      "question": "A visitor brings a toaster that trips power, and no competent mains-electricity repair station is authorised. What should intake do?",
      "options": [
        "Decline mains testing today and refer the visitor for qualified electrical repair.",
        "Place the appliance in a secure hold for a later event where an electrician might attend.",
        "Offer a non-invasive visual assessment and explain likely faults without energising."
      ],
      "answer": 0,
      "explanation": "Unapproved mains testing is outside scope; retaining hazardous items or making unverified repair claims adds risk."
    },
    {
      "id": "cafe:4",
      "level": 2,
      "question": "You need a reliable roster that can handle tentative availability, explicit acceptance and cancellation. Which record model is best?",
      "options": [
        "Assign shifts optimistically and treat lack of cancellation as acceptance.",
        "Keep separate availability, offers, confirmations, role changes and cancellation records.",
        "Store one availability calendar and derive confirmed shifts from the latest edits."
      ],
      "answer": 1,
      "explanation": "Distinct states preserve consent and make capacity promises defensible."
    },
    {
      "id": "cafe:5",
      "level": 2,
      "question": "Hardware arrivals rise sharply while the sewing table remains free. The event is near capacity. What action best respects repair skills and visitor time?",
      "options": [
        "Reassign sewing volunteers to welcome while allowing electronics owners to examine devices at a shared table.",
        "Temporarily transfer low-risk hardware diagnostics to sewing volunteers after a short briefing.",
        "Close or slow hardware intake, explain wait/referral options, and maintain stations within accepted skill and scope."
      ],
      "answer": 2,
      "explanation": "Volunteer capacity isn't interchangeable across repair skills; throughput should not bypass agreed safety or intake."
    },
    {
      "id": "cafe:6",
      "level": 3,
      "question": "A venue excludes messy activity, your cover specifies particular repair categories, and a visiting expert offers soldering. What is the correct decision rule?",
      "options": [
        "Seek scope-specific approval, cover and competent safeguards before permitting it.",
        "Offer the expert a supervised trial during quiet periods before formally changing the published scope.",
        "Allow low-temperature soldering if the expert brings fume extraction and fire protection."
      ],
      "answer": 0,
      "explanation": "Expertise alone can't authorise work beyond venue rules, insurance and risk controls."
    },
    {
      "id": "cafe:7",
      "level": 3,
      "question": "Two fixers cancel shortly before doors open, and pre-registration already exceeds safe station capacity. How do you proceed?",
      "options": [
        "Use experienced visitors to support volunteers on unstaffed benches if they sign consent.",
        "Cap arrivals to staffed capacity with clear queue criteria and referral options.",
        "Keep the original scope but prioritise the safest repairs first, explaining delays as they arise."
      ],
      "answer": 1,
      "explanation": "Published commitments must yield to confirmed capacity; clear intake limits protect people without substituting untrained labour."
    },
    {
      "id": "cafe:8",
      "level": 3,
      "question": "Twenty items were presented but only five were fully repaired. Which outcome measure is most useful for the next event?",
      "options": [
        "Focus on the repair-success percentage because it is the simplest reproducible outcome.",
        "Record all attempted devices as diverted from waste, since each extended its useful life.",
        "Record completed fixes, diagnosis/referrals, safe declines, owner learning, demand and service limits."
      ],
      "answer": 2,
      "explanation": "Outcome integrity matters: diagnostic learning and referral value are real, but attempted repairs are not automatically waste diverted."
    },
    {
      "id": "cafe:9",
      "level": 3,
      "question": "The venue is free for next month, but there is no lead, an incident follow-up remains open and electrical scope is unapproved. Should you confirm the date?",
      "options": [
        "Hold the date; finish incident follow-up and confirm a lead and scope before publicity.",
        "Use a rotating technician as nominal lead to preserve the scheduled event and close paperwork afterward.",
        "Confirm a textiles-only event provided the host approves the narrower activity in writing."
      ],
      "answer": 0,
      "explanation": "A cheap venue and potential fixers do not replace lead accountability and incident follow-up."
    }
  ]
} as unknown as Record<"laptop"|"cafe",Challenge[]>;
