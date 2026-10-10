import type { Challenge } from "./adaptive";
/** Fictional decision cases; training only, not a repair/electrical qualification. */
export const simChallenges = {
  "laptop": [
    {
      "id": "laptop:0",
      "level": 1,
      "question": "A laptop shows the OEM logo then 'No bootable device'. What did it demonstrably achieve?",
      "options": [
        "It reached firmware output, but no successful operating-system boot is shown",
        "It completed the entire hardware self-test, so only Windows could be at fault",
        "It confirmed its drive is dead, though the mainboard and display appear functional"
      ],
      "answer": 0,
      "explanation": "Visible firmware output distinguishes boot stage from no-power and no-video."
    },
    {
      "id": "laptop:1",
      "level": 1,
      "question": "A charging light blinks. What does the blink pattern establish by itself?",
      "options": [
        "Compare the flash timing against a generic BIOS blink-code table from another brand",
        "Use the exact model's vendor diagnostic guide before assigning meaning to the flashes",
        "Check the battery-charge percentage, since all flashing lights indicate low capacity"
      ],
      "answer": 1,
      "explanation": "Blink codes are not universal."
    },
    {
      "id": "laptop:2",
      "level": 2,
      "question": "The BIOS lists no SSD, but a known-good USB boots reliably. What would you test next?",
      "options": [
        "Boot a diagnostic USB again to rule out its bootloader before investigating hardware",
        "Check SSD visibility in firmware, then safely compare the connector and known-good drive",
        "Recreate the operating-system boot entry before checking whether the SSD is detected"
      ],
      "answer": 1,
      "explanation": "A bootable USB isolates some boot and power functions, not the original SSD or connector."
    },
    {
      "id": "laptop:3",
      "level": 2,
      "question": "External HDMI works; internal screen is black but a faint image is visible under a torch. Leading fault family?",
      "options": [
        "Investigate the panel illumination circuit, supply and compatible display cable path",
        "Prioritise GPU failure because only an external screen receives reliable image output",
        "Start with storage corruption because Windows can disable the internal backlight"
      ],
      "answer": 0,
      "explanation": "Faint video implies image data exists but illumination may not."
    },
    {
      "id": "laptop:4",
      "level": 2,
      "question": "Laptop powers down after ten minutes under load, but works cooled and unloaded. Strongest next hypothesis?",
      "options": [
        "Treat it as likely SSD corruption and reinstall software after a successful cold boot",
        "Compare temperatures, fan behaviour and power delivery under controlled safe loads",
        "Replace the battery because power-off under load points uniquely to battery aging"
      ],
      "answer": 1,
      "explanation": "Load and temperature correlation matters."
    },
    {
      "id": "laptop:5",
      "level": 2,
      "question": "One 19V adapter measures 19.4V unloaded but collapses under a known-good compatible load. What can you conclude?",
      "options": [
        "Record the unloaded reading as sufficient evidence the adapter is within specification",
        "Check the adapter and cable under load with a safe, compatible controlled comparison",
        "Conclude the laptop is shorting the adapter because its normal load lowers voltage"
      ],
      "answer": 1,
      "explanation": "No-load readings do not prove current delivery."
    },
    {
      "id": "laptop:6",
      "level": 2,
      "question": "Your first successful boot follows a RAM reseat but subsequent boots fail when the hinge moves. What do you record?",
      "options": [
        "Report a successful RAM repair, but document hinge movement as a new separate fault",
        "Retest RAM alone because a reseat is more diagnostic than the subsequent failures",
        "Record an unresolved intermittent failure and reproduce the movement relationship"
      ],
      "answer": 2,
      "explanation": "Single success is not a verified fix."
    },
    {
      "id": "laptop:7",
      "level": 3,
      "question": "You have a black internal LCD, stable HDMI, intermittent eDP image during hinge movement and a spare incompatible panel. Choose the most defensible test plan.",
      "options": [
        "Isolate power and verify the hinge/eDP cable route, using only matched test components",
        "Use the spare panel via a mechanical adapter to distinguish cable from backlight faults",
        "Replace the board first, since unstable panel video can indicate a graphics failure"
      ],
      "answer": 0,
      "explanation": "Controlled compatible checks beat incompatible swaps."
    },
    {
      "id": "laptop:8",
      "level": 3,
      "question": "A data-bearing laptop's owner requests refurbishment, but its MDM enrolment belongs to a third party and SSD erase logs are incomplete. What is the safe release gate?",
      "options": [
        "Hold release until authorised MDM removal and evidence-backed storage treatment exist",
        "Accept owner approval and complete data checks later, before listing the device for sale",
        "Erase through local recovery media, then remove the management lock during setup"
      ],
      "answer": 0,
      "explanation": "Operational use requires resolving both identity and data responsibility."
    },
    {
      "id": "laptop:9",
      "level": 3,
      "question": "Your virtual tests show 19.5V at jack, no regulator output and intermittent power LED. What is the strongest report without board-level authorisation?",
      "options": [
        "Record a likely regulator fault based on the missing output, pending safe board evaluation",
        "Document measured rails, alternative faults and the point where escalation is required",
        "Inspect the jack again and report the input adapter as defective until replaced"
      ],
      "answer": 1,
      "explanation": "A failed downstream reading does not identify a single defective component."
    },
    {
      "id": "laptop:10",
      "level": 3,
      "question": "Five refurbished laptops show 4 successful cold boots but only 2 successful warm boots. Battery and adapter models varied. Which outcome statement is scientifically supportable?",
      "options": [
        "Document the observed difference and repeat with controlled adapters and temperature",
        "Treat the warm-boot failures as confirmed motherboard defects across this small batch",
        "Estimate fleet reliability using cold-boot results as the representative benchmark"
      ],
      "answer": 0,
      "explanation": "A non-controlled sample can't support root-cause attribution."
    },
    {
      "id": "laptop:11",
      "level": 3,
      "question": "A laptop reports SMART warnings but boots fine, has a tired battery and an uncertain replacement screen. What's the correct release judgement?",
      "options": [
        "Offer sale after a fresh OS install, disclosing the battery and screen as cosmetic wear",
        "Keep the device on hold until faults are assessed, resolved or explicitly disclosed",
        "Replace the battery first, then report the disk and screen as untested accessories"
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
        "Treat it as tentative until the date, permitted activities and conditions are confirmed",
        "Record it as confirmed if the host agrees verbally and no deposit is requested",
        "Confirm the venue only after a volunteer roster exists, irrespective of host terms"
      ],
      "answer": 0,
      "explanation": "Interest is not an agreement."
    },
    {
      "id": "cafe:1",
      "level": 1,
      "question": "A volunteer indicates availability. Is that an accepted shift?",
      "options": [
        "Mark the shift accepted once an availability entry has been saved in the roster",
        "Require an assignment offer and explicit acceptance from the nominated volunteer",
        "Treat a prior event's attendance as acceptance of the next month's equivalent shift"
      ],
      "answer": 1,
      "explanation": "Availability, assignment and confirmation are distinct."
    },
    {
      "id": "cafe:2",
      "level": 2,
      "question": "A venue allows sewing and laptops but prohibits bikes. Two bike volunteers are free. What public event scope is correct?",
      "options": [
        "Advertise bike repairs as conditional, since qualified bike volunteers are attending",
        "Publish only approved stations, and request separate authorisation for bikes",
        "List bikes in an overflow category and make the venue decision on the event day"
      ],
      "answer": 1,
      "explanation": "Scope combines permission and staffing."
    },
    {
      "id": "cafe:3",
      "level": 2,
      "question": "A visitor presents a toaster that trips power, but your team has no authorised electrical specialist. What is the intake path?",
      "options": [
        "Decline onsite energising, document symptoms and refer to qualified electrical service",
        "Offer a visual-only check and retain the toaster until electrical support is found",
        "Permit basic plug inspection and supply testing as long as the owner supervises"
      ],
      "answer": 0,
      "explanation": "Risk can't be resolved by enthusiasm."
    },
    {
      "id": "cafe:4",
      "level": 2,
      "question": "A coordinator wants to count expressions of interest as confirmed volunteer shifts. What data model should be used?",
      "options": [
        "Use an availability flag plus a separate published rota as sufficient confirmation",
        "Record availability, proposed assignment, acceptance and cancellation separately",
        "Treat event invitation replies as accepted shifts if volunteers don't decline"
      ],
      "answer": 1,
      "explanation": "Scheduling workflows need real confirmations."
    },
    {
      "id": "cafe:5",
      "level": 2,
      "question": "At 10:30 the sewing station is free but hardware backlog is ten deep. What's a better operational response?",
      "options": [
        "Move hardware jobs to the available sewing table if the tools can be relocated",
        "Keep station scope distinct; cap admissions and refer hardware jobs as needed",
        "Allow walk-ins to start self-diagnosis while hardware volunteers clear the queue"
      ],
      "answer": 1,
      "explanation": "Competence and station scope are not interchangeable."
    },
    {
      "id": "cafe:6",
      "level": 3,
      "question": "Your insurer allows defined portable repairs, the venue excludes messy processes, and a specialist offers ad-hoc soldering. How do you decide?",
      "options": [
        "Allow soldering only after written venue and insurer scope approval plus safety planning",
        "Run a supervised demonstration without confirming whether soldering is excluded",
        "Treat specialist credentials as sufficient and record any incident after the event"
      ],
      "answer": 0,
      "explanation": "Permission must cover the actual processes and risks."
    },
    {
      "id": "cafe:7",
      "level": 3,
      "question": "A repair event is oversubscribed while two volunteers cancel. Which response optimises outcomes without unsafe throughput?",
      "options": [
        "Cap accepted work to verified supervision, and communicate revised wait and referrals",
        "Allow confirmed visitors to help other repairers, avoiding the need for extra staff",
        "Prioritise all easy jobs and leave complex items queued until the event has ended"
      ],
      "answer": 0,
      "explanation": "Manage queue exposure and expectations with a controlled ceiling."
    },
    {
      "id": "cafe:8",
      "level": 3,
      "question": "The event handles 20 items, only five fully repaired. Volunteers think it failed. What evaluation is more useful?",
      "options": [
        "Compare completed fixes against attendance, then use that conversion rate alone",
        "Track diagnoses, safe refusals, learning, referrals, repair outcomes and time spent",
        "Focus on visitor satisfaction first, since a low repair rate can be offset by goodwill"
      ],
      "answer": 1,
      "explanation": "Repair Café value is broader than fixes, but recorded honestly."
    },
    {
      "id": "cafe:9",
      "level": 3,
      "question": "Your planned second event has free venue and spare volunteers, but no coordinator, incomplete first-event incident report and unapproved electrical scope. Do you open?",
      "options": [
        "Run only low-risk stations under the substitute while approvals are arranged afterward",
        "Close the incident review later if today's event can be staffed by qualified people",
        "Require approved continuity and incident actions; postpone if authority remains absent"
      ],
      "answer": 2,
      "explanation": "Unresolved controls block a responsible event."
    }
  ]
} as unknown as Record<"laptop"|"cafe",Challenge[]>;
