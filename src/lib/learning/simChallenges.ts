import type { Challenge } from "./adaptive";
/** Fictional decision cases; training only, not a repair/electrical qualification. */
export const simChallenges = {
  "laptop": [
    {
      "id": "laptop:0",
      "level": 1,
      "question": "A laptop shows the OEM logo then 'No bootable device'. What did it demonstrably achieve?",
      "options": [
        "Some power-on and firmware display; not a successful OS boot",
        "A complete storage failure diagnosis",
        "No POST at all"
      ],
      "answer": 0,
      "explanation": "Visible firmware output distinguishes boot stage from no-power and no-video."
    },
    {
      "id": "laptop:1",
      "level": 1,
      "question": "A charging light blinks. What does the blink pattern establish by itself?",
      "options": [
        "Defective CPU",
        "A symptom requiring a model-specific diagnostic reference",
        "Windows corruption"
      ],
      "answer": 1,
      "explanation": "Blink codes are not universal."
    },
    {
      "id": "laptop:2",
      "level": 2,
      "question": "The BIOS lists no SSD, but a known-good USB boots reliably. What would you test next?",
      "options": [
        "Reinstall Windows on the missing drive",
        "Record firmware detection, storage connector and a known-good compatible SSD path while respecting data consent",
        "Replace the LCD"
      ],
      "answer": 1,
      "explanation": "A bootable USB isolates some boot and power functions, not the original SSD or connector."
    },
    {
      "id": "laptop:3",
      "level": 2,
      "question": "External HDMI works; internal screen is black but a faint image is visible under a torch. Leading fault family?",
      "options": [
        "Backlight, panel supply or cable path",
        "CPU instruction set",
        "Storage partition table"
      ],
      "answer": 0,
      "explanation": "Faint video implies image data exists but illumination may not."
    },
    {
      "id": "laptop:4",
      "level": 2,
      "question": "Laptop powers down after ten minutes under load, but works cooled and unloaded. Strongest next hypothesis?",
      "options": [
        "Loose Windows activation",
        "Thermal or power protection under load, needing controlled comparative evidence",
        "Broken display panel"
      ],
      "answer": 1,
      "explanation": "Load and temperature correlation matters."
    },
    {
      "id": "laptop:5",
      "level": 2,
      "question": "One 19V adapter measures 19.4V unloaded but collapses under a known-good compatible load. What can you conclude?",
      "options": [
        "Voltage unloaded confirms healthy supply",
        "Adapter path is suspect; compare with safe load-controlled substitution",
        "Motherboard is certainly dead"
      ],
      "answer": 1,
      "explanation": "No-load readings do not prove current delivery."
    },
    {
      "id": "laptop:6",
      "level": 2,
      "question": "Your first successful boot follows a RAM reseat but subsequent boots fail when the hinge moves. What do you record?",
      "options": [
        "Fixed by RAM reseat",
        "All symptoms mean RAM",
        "Intermittent fault; document repeatability and the movement condition"
      ],
      "answer": 2,
      "explanation": "Single success is not a verified fix."
    },
    {
      "id": "laptop:7",
      "level": 3,
      "question": "You have a black internal LCD, stable HDMI, intermittent eDP image during hinge movement and a spare incompatible panel. Choose the most defensible test plan.",
      "options": [
        "Record hinge dependence, isolate power and inspect/verify matched eDP cable path before component substitution",
        "Install incompatible LCD for a quick A/B check",
        "Replace motherboard before mechanical inspection"
      ],
      "answer": 0,
      "explanation": "Controlled compatible checks beat incompatible swaps."
    },
    {
      "id": "laptop:8",
      "level": 3,
      "question": "A data-bearing laptop's owner requests refurbishment, but its MDM enrolment belongs to a third party and SSD erase logs are incomplete. What is the safe release gate?",
      "options": [
        "Use a bypass and leave incomplete log hidden",
        "Require legitimate MDM release and verified authorised storage outcome before disposition",
        "Erase user profile only"
      ],
      "answer": 1,
      "explanation": "Operational use requires resolving both identity and data responsibility."
    },
    {
      "id": "laptop:9",
      "level": 3,
      "question": "Your virtual tests show 19.5V at jack, no regulator output and intermittent power LED. What is the strongest report without board-level authorisation?",
      "options": [
        "Declare the regulator faulty as proven",
        "Apply a live soldering iron as test",
        "State measured points, fault families, uncertainty and escalation to an appropriately competent technician"
      ],
      "answer": 2,
      "explanation": "A failed downstream reading does not identify a single defective component."
    },
    {
      "id": "laptop:10",
      "level": 3,
      "question": "Five refurbished laptops show 4 successful cold boots but only 2 successful warm boots. Battery and adapter models varied. Which outcome statement is scientifically supportable?",
      "options": [
        "Report test conditions and a possible temperature/power association; standardise controls before claiming root cause",
        "Declare 60% motherboard reliability",
        "Call all machines fit for resale"
      ],
      "answer": 0,
      "explanation": "A non-controlled sample can't support root-cause attribution."
    },
    {
      "id": "laptop:11",
      "level": 3,
      "question": "A laptop reports SMART warnings but boots fine, has a tired battery and an uncertain replacement screen. What's the correct release judgement?",
      "options": [
        "List as fully functional if the desktop opens",
        "Keep hold until storage, battery and display conditions have verified outcomes and honest disclosure",
        "Only screen matters"
      ],
      "answer": 1,
      "explanation": "A single successful boot cannot certify multiple failing/untested systems."
    }
  ],
  "cafe": [
    {
      "id": "cafe:0",
      "level": 1,
      "question": "A venue host says 'you can probably use the hall'. Is this a confirmed booking?",
      "options": [
        "Only after written date/activity approval",
        "Yes if volunteers are ready",
        "Yes if no fee"
      ],
      "answer": 0,
      "explanation": "Interest is not an agreement."
    },
    {
      "id": "cafe:1",
      "level": 1,
      "question": "A volunteer indicates availability. Is that an accepted shift?",
      "options": [
        "Yes on a monthly roster",
        "Not until an offer and explicit acceptance",
        "Only if they know tools"
      ],
      "answer": 1,
      "explanation": "Availability, assignment and confirmation are distinct."
    },
    {
      "id": "cafe:2",
      "level": 2,
      "question": "A venue allows sewing and laptops but prohibits bikes. Two bike volunteers are free. What public event scope is correct?",
      "options": [
        "Advertise bikes anyway",
        "Advertise only authorised repair stations and capacity; request a separate bike approval",
        "Leave visitors to decide at arrival"
      ],
      "answer": 1,
      "explanation": "Scope combines permission and staffing."
    },
    {
      "id": "cafe:3",
      "level": 2,
      "question": "A visitor presents a toaster that trips power, but your team has no authorised electrical specialist. What is the intake path?",
      "options": [
        "External competent electrical referral; no exploratory energising",
        "Test another socket",
        "Ask an enthusiastic volunteer"
      ],
      "answer": 0,
      "explanation": "Risk can't be resolved by enthusiasm."
    },
    {
      "id": "cafe:4",
      "level": 2,
      "question": "A coordinator wants to count expressions of interest as confirmed volunteer shifts. What data model should be used?",
      "options": [
        "Single boolean called available",
        "Distinct availability, proposed assignment, acceptance and cancellation states",
        "A list of first names"
      ],
      "answer": 1,
      "explanation": "Scheduling workflows need real confirmations."
    },
    {
      "id": "cafe:5",
      "level": 2,
      "question": "At 10:30 the sewing station is free but hardware backlog is ten deep. What's a better operational response?",
      "options": [
        "Transfer all jobs to sewing station",
        "Keep scope-specific stations, adjust admissions and communicate wait/referral options",
        "Skip triage"
      ],
      "answer": 1,
      "explanation": "Competence and station scope are not interchangeable."
    },
    {
      "id": "cafe:6",
      "level": 3,
      "question": "Your insurer allows defined portable repairs, the venue excludes messy processes, and a specialist offers ad-hoc soldering. How do you decide?",
      "options": [
        "Permit everything the specialist proposes",
        "Seek scope-specific written venue/insurance permission and safety controls; exclude unapproved activity",
        "Add a disclaimer and proceed"
      ],
      "answer": 1,
      "explanation": "Permission must cover the actual processes and risks."
    },
    {
      "id": "cafe:7",
      "level": 3,
      "question": "A repair event is oversubscribed while two volunteers cancel. Which response optimises outcomes without unsafe throughput?",
      "options": [
        "Throttle intake by hazard and capacity, communicate priorities and document referrals",
        "Let visitors do live electrical repairs",
        "Remove check-in records to save time"
      ],
      "answer": 0,
      "explanation": "Manage queue exposure and expectations with a controlled ceiling."
    },
    {
      "id": "cafe:8",
      "level": 3,
      "question": "The event handles 20 items, only five fully repaired. Volunteers think it failed. What evaluation is more useful?",
      "options": [
        "Count repairs only",
        "Measure diagnoses, safe refusals, learning, referrals, returns, time and visitor outcomes",
        "Report all items fixed"
      ],
      "answer": 1,
      "explanation": "Repair Café value is broader than fixes, but recorded honestly."
    },
    {
      "id": "cafe:9",
      "level": 3,
      "question": "Your planned second event has free venue and spare volunteers, but no coordinator, incomplete first-event incident report and unapproved electrical scope. Do you open?",
      "options": [
        "Only after governance/incident closure and approved scope are secured",
        "Yes because venue cost is zero",
        "Yes if no publicity"
      ],
      "answer": 0,
      "explanation": "Unresolved controls block a responsible event."
    }
  ]
} as unknown as Record<"laptop"|"cafe",Challenge[]>;
