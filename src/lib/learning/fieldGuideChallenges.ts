import type { Challenge, Difficulty } from "./adaptive";
type Check = {question:string; options:string[]; answer:number; explanation:string};
const authored={
  "field-guide:dubbo-businesses:2026-10-10.1": {
    "models": {
      "practitioner": [
        "An MSP replaces a customer's leased laptop, while a retail repairer holds an abandoned repair. Which source has clearer release authority?",
        [
          "The MSP because replacement means ownership transferred",
          "Neither until owner/lease terms and authority to dispose are verified",
          "The repairer because the machine is physically in its shop"
        ],
        1,
        "Custody and replacement do not establish title."
      ],
      "expert": [
        "A vendor offers returned devices, but warranties require return to manufacturer, customers hold title and staff have differing practices. What sourcing decision is defensible?",
        [
          "A small release pilot only after contract, asset owner, custody and data responsibilities are documented",
          "Ask whoever has physical stock to sign a release",
          "Treat all returned devices as waste"
        ],
        0,
        "Document source rights and accountabilities rather than relying on service type."
      ]
    },
    "people": {
      "practitioner": [
        "A website names a managing director, technical lead and regional technician. Which is the strongest org-chart claim?",
        [
          "Technical lead must supervise the regional technician",
          "The technical lead and regional technician are verified roles; reporting line remains unverified",
          "The website ordering indicates the hierarchy"
        ],
        1,
        "Job titles do not prove reporting lines."
      ],
      "expert": [
        "A corporate register names an officer but current recruitment material names a different service manager. Who should approve a five-device pilot?",
        [
          "Use a documented delegation chain and verify legal authority and operational ownership before agreement",
          "Always ask the highest profile name",
          "Assume the service manager can sign asset transfers"
        ],
        0,
        "Managerial role and legal disposal authority require distinct verification."
      ]
    },
    "workplace": {
      "practitioner": [
        "Two anonymous reviews from another state mention on-call work. A current Dubbo advert says flexible hours but no roster. What can you infer?",
        [
          "Local work is definitely on-call",
          "The reviews give questions to ask but cannot establish current Dubbo hours",
          "Flexible always means no overtime"
        ],
        1,
        "Evidence differs in time, location and sample."
      ],
      "expert": [
        "A prospective employer claims excellent flexibility, but a role includes daily regional travel and weekend SLA cover. Which interview questions best resolve the contradiction?",
        [
          "Ask for duty percentages, call-out frequency, travel compensation and real examples",
          "Ask only whether staff enjoy work",
          "Assume flexible hours negate on-call obligations"
        ],
        0,
        "Evidence of concrete rosters and pay conditions is preferable to culture slogans."
      ]
    },
    "lifecycle": {
      "practitioner": [
        "A repair partner replaces 40 fleet devices, but the outgoing laptops are still under a lease and data policy. What's the viable next step?",
        [
          "Arrange a signed process review with the authorised owner and existing ITAD operator",
          "Collect them and inspect later",
          "Request customer passwords for wiping"
        ],
        0,
        "Lease and existing disposal obligations constrain transfers."
      ],
      "expert": [
        "A facility can release ten wiped devices, but wipe logs omit serials and batteries are unassessed. Which handoff contract is sound?",
        [
          "Accept as certified clean",
          "Separate provisional custody from sanitisation and battery acceptance gates; require verifiable evidence",
          "Sell the devices as-is to reduce workload"
        ],
        1,
        "Transfer, sanitisation and safety need independent traceable evidence."
      ]
    },
    "projects": {
      "practitioner": [
        "A repairer offers mentoring but no devices, while a fleet owner offers devices but no technical support. What pitch matches each partner?",
        [
          "Give both the same reuse proposal",
          "Offer mentoring/referral to the repairer and scoped chain-of-custody pilot to the fleet owner",
          "Ask both to host a public café"
        ],
        1,
        "Specific partnerships require distinct value propositions."
      ],
      "expert": [
        "You have two afternoons per month, ten untested devices and no buyer commitments. Which experiment has the highest learning value?",
        [
          "Start a five-device bounded intake and measure time, safe outcomes and bottlenecks",
          "Accept another hundred devices to improve supply",
          "Build a new app before examining stock"
        ],
        0,
        "A controlled small experiment exposes capacity and economic limits."
      ]
    },
    "fieldwork": {
      "practitioner": [
        "A 2007 report lists a director; a current register identifies a changed entity. Which correction has priority?",
        [
          "Delete every historical document",
          "Amend the current claim with a dated source and keep the historical note labelled",
          "Assume the report is still valid"
        ],
        1,
        "Preserve dated history while correcting current claims."
      ],
      "expert": [
        "After thirty days, three prospects provided no release authority, two offered referrals and one offered five laptops with data ambiguity. Which action is evidence-backed?",
        [
          "Report no confirmed reusable volume, pursue referral opportunity and resolve ownership/data before accepting stock",
          "Report five devices secured",
          "Expand mass outreach immediately"
        ],
        0,
        "Separate opportunities, conditional leads and confirmed handoffs."
      ]
    }
  },
  "field-guide:dubbo-ewaste-outreach:2026-10-11.1": {
    "locate": {
      "practitioner": [
        "Two Dubbo repair shops: A lists abandoned jobs but no release policy; B has owner-signed retirements but unknown drive inventory. Which lead to qualify first?",
        [
          "A because devices are physically present",
          "B, subject to storage, custody and sanitisation controls",
          "Both because each has spare equipment"
        ],
        1,
        "An authority path is necessary but not sufficient."
      ],
      "expert": [
        "A provider proposes 20 laptops sourced from three client organisations but offers one generic handover letter. Which acceptance process is valid?",
        [
          "Require each owner and authorised release, asset-level custody, and data treatment by source",
          "Use the provider's master invoice as ownership proof",
          "Accept all if the devices are old"
        ],
        0,
        "Multiple owners need explicit aligned permission."
      ]
    },
    "authority": {
      "practitioner": [
        "A release letter covers desktops but not their storage devices. A manager urges pickup. What should be recorded?",
        [
          "Accept everything as written",
          "Clarify excluded storage, physical custody and sanitisation responsibility before collection",
          "Destroy the drives without authority"
        ],
        1,
        "Permission scope must match the assets and data."
      ],
      "expert": [
        "An authorised organisation will release devices only if it receives a sanitisation certificate. Your tools provide consumer reset but no verification logs. What response is defensible?",
        [
          "Promise certification after collection",
          "Offer a transparent qualified ITAD referral or defer until verifiable service is available",
          "Remove drives and sign a generic receipt"
        ],
        1,
        "Do not claim professional erasure capability you cannot demonstrate."
      ]
    },
    "capacity": {
      "practitioner": [
        "Two pilots are offered: 25 mixed devices with uncertain batteries, or five inventoried laptops with written release. Your weekly capacity is three hours. Best choice?",
        [
          "Take both to build momentum",
          "Pilot five within bounded capacity and reject the unsafe/uncontrolled backlog",
          "Choose the lot with greatest mass"
        ],
        1,
        "Throughput, safety and custody trump volume."
      ],
      "expert": [
        "The first pilot consumes twice the expected volunteer hours and produces only one saleable laptop. What should the next fortnight's plan prioritise?",
        [
          "Increase intake volumes to offset the loss",
          "Recalculate labour/unit, examine the failure reasons and set a stop-or-adjust threshold",
          "Spend time designing a new logo"
        ],
        1,
        "Learning from measured unit economics and constraints is the goal."
      ]
    }
  }
} as const;
export function fieldGuideChallenge(storageKey:string, lessonId:string, level:Difficulty, fallback:Check):Check {
  const group=authored[storageKey as keyof typeof authored];
  const entry=group ? (group as Record<string,{practitioner:readonly [string,readonly string[],number,string],expert:readonly [string,readonly string[],number,string]}>)[lessonId] : undefined;
  if(!entry || level===1)return fallback;
  const [question,options,answer,explanation]=level===3?entry.expert:entry.practitioner;
  return {question,options:[...options],answer,explanation};
}
