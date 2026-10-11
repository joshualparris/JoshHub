/**
 * Evidence-first laptop power-fault capstone.
 * Fictionalised teaching case: no customer names, serials, photographs or private data.
 * Decisions assess *what observations justify*, not guessed component replacements.
 * This does not train or authorise live motherboard probing.
 */
export type Domain = "safety" | "reasoning" | "data" | "communication";
export type Choice = { id:string; text:string; correct:boolean; feedback:string; misconception?:string };
export type Decision = {
  id:string; title:string; phase:string; minutes:number;
  observation:string; question:string; domain:Domain;
  choices:Choice[]; principle:string; expertPrompt:string; hint:string;
};
export type Attempt = { selection:string; tries:number; firstCorrect:boolean; explanation:string };
export type DecisionHistory = Record<string,Attempt>;
export type Transfer = { id:string; situation:string; question:string; choices:Choice[]; principle:string };
export type LearningTier = "guided" | "investigator" | "expert";

export const powerPath = [
  {name:"Power source",detail:"Printed wattage or unloaded voltage does not prove voltage stability under laptop load."},
  {name:"DC input",detail:"Connector fit, contacts, protection and identification signals each matter. No visible damage is not proof of health."},
  {name:"Always-on power",detail:"Standby rails and embedded controller must behave correctly before a normal startup sequence."},
  {name:"System start",detail:"CPU/RAM/firmware initialise; a momentary LED does not demonstrate successful POST."},
  {name:"Firmware & storage",detail:"Only after startup progresses can the SSD and operating system become primary boot suspects."}
] as const;

const c=(id:string,text:string,correct:boolean,feedback:string,misconception?:string):Choice=>({id,text,correct,feedback,misconception});

export const decisions:Decision[] = [
  {
    id:"intake",title:"Protect the customer first",phase:"Intake & authority",minutes:6,domain:"safety",
    observation:"A laptop formerly exposed to tea worked after an earlier repair. It now briefly flashes a white LED when power is pressed. The owner wants the files kept.",
    question:"What belongs in the first diagnostic entry?",
    choices:[
      c("replace","Replace the battery now and explain that it is routine maintenance.",false,"There is no battery evidence yet. A replacement creates cost and may not address the power path.","Part-swapping before observing"),
      c("record","Log consent, symptoms, spill history, battery safety and data priority.",true,"Correct. Consent, condition and data risk change what you may safely do."),
      c("boot","Start with Windows recovery media because the white LED proves the CPU ran.",false,"An LED is not proof of firmware execution or POST.","Confusing an LED with POST"),
      c("erase","Erase the SSD to rule out an operating-system corruption.",false,"Destructive and not justified when no firmware startup is observed.","Destroying data")
    ],
    principle:"A clear intake establishes what is observed, what is reported, what is authorised, and what must not be lost.",
    expertPrompt:"Write a two-sentence intake note distinguishing customer history from your own measurements.",
    hint:"Whose device is it, what must survive, and what would make opening it unsafe?"
  },
  {
    id:"stage",title:"Locate the stage of failure",phase:"Symptom taxonomy",minutes:6,domain:"reasoning",
    observation:"Power button: white LED lights for a split second then goes dark. There is no logo, fan activity or image. A separate charging LED can flash.",
    question:"Which description is least misleading?",
    choices:[
      c("boot","Windows no-boot: reinstall Windows before any hardware isolation.",false,"No POST or firmware display was established, so an OS-first label is premature.","No boot versus no power-on"),
      c("screen","Display-only failure: the system is definitely running without video.",false,"There is no evidence of sustained startup behind the dark screen.","No video versus no POST"),
      c("gpu","Graphics failure: the LED flash confirms BIOS and RAM are working.",false,"The LED does not confirm either component.","LED overinterpretation"),
      c("early","Early power/startup failure; exact stage and failed part remain unknown.",true,"Correct. Record what did not occur without declaring a defective part.")
    ],
    principle:"Separate no power, early startup/no POST, no video and no boot. LED patterns are model-specific; never infer a component from colour alone.",
    expertPrompt:"Describe two additional signs that would change your fault category and why.",
    hint:"Did the machine ever reach a vendor logo, sustained power state or operating system?"
  },
  {
    id:"charger",title:"What does 20 volts establish?",phase:"External power path",minutes:7,domain:"reasoning",
    observation:"A 20 V 65 W Lenovo charger reads 20 V with nothing connected. A 20 V universal supply has a physically fitting tip but uncertain identification/contact compatibility.",
    question:"Which claim is justified by these observations?",
    choices:[
      c("proof","The original adapter is good under load and the DC socket is healthy.",false,"An unloaded reading cannot prove load regulation or internal delivery.","Unloaded voltage proves power delivery"),
      c("watt","A higher advertised 96 W rating means any barrel tip is safe to use.",false,"Tip dimensions, pinout, polarity and possible ID wiring must match.","Wattage equals compatibility"),
      c("narrow","20 V unloaded only; loaded output and internal delivery are unknown.",true,"Correct. A verified compatible substitute or controlled load test would add evidence."),
      c("cpu","Because the adapter reads 20 V, the processor is the most likely fault.",false,"No internal power rails or CPU inputs have been measured.","Jumping to a downstream part")
    ],
    principle:"Voltage at an unplugged adapter is a necessary but insufficient observation. Do not use an uncertain universal tip as proof of a bad original.",
    expertPrompt:"State what a properly compatible charger substitution would and would not rule out.",
    hint:"Distinguish what was measured with no load from what happens during a startup attempt."
  },
  {
    id:"meter",title:"The deceptive 285-ohm reading",phase:"Measurement integrity",minutes:7,domain:"safety",
    observation:"With both charger and battery disconnected, USB shell to chassis screw reads near 0 ohms. USB shell to a pin thought to be the barrel centre reads 285 ohms. The jack contacts have not been positively identified.",
    question:"How should a technician record the 285-ohm result?",
    choices:[
      c("ground","Confirm it proves +20 V input has no short to ground.",false,"The probed contact might be an ID/sense pin rather than +20 V. Neither contact nor rail is verified.","Unknown test point equals verified rail"),
      c("short","Confirm 285 ohms means the motherboard is shorted and needs replacement.",false,"Resistance magnitude alone and an unknown pin cannot locate a short.","Ohms as a component verdict"),
      c("live","Repeat in resistance mode with the charger plugged in to confirm.",false,"Never measure resistance on a powered circuit; this risks damage or injury.","Resistance on live circuits"),
      c("unknown","Record contact locations and mark 285 ohms inconclusive without a pinout.",true,"Correct. This protects against a false conclusion from an unidentified test point.")
    ],
    principle:"A reading without verified probe identity and circuit state is not a trustworthy diagnosis. Resistance tests are conducted only on isolated, unpowered circuits.",
    expertPrompt:"Explain why 0 ohms between chassis-connected metals is informative but not a motherboard fault diagnosis.",
    hint:"What if the contact you called +20 V is actually a charger-identification contact?"
  },
  {
    id:"isolate",title:"Interpret isolation tests honestly",phase:"Controlled comparison",minutes:7,domain:"reasoning",
    observation:"Using the original supply, the same brief white flash occurs with the internal battery unplugged; after a power reset; with SSD removed; with removable RAM removed; and with the Wi-Fi card removed. Model documentation indicates onboard RAM may be present.",
    question:"What is the strongest evidence-based update?",
    choices:[
      c("allgood","All removed parts are proven fully functional and can be resold as tested.",false,"The fault being unchanged does not test removed parts for health.","Unchanged symptom proves good part"),
      c("reduce","Removed parts are less likely sole causes; power and firmware remain suspects.",true,"Correct. Isolation reduces hypotheses; it rarely establishes a precise failed component."),
      c("cpu","This conclusively proves the CPU is bad because it still does not POST.",false,"No CPU rail, enable, reset or firmware evidence supports that conclusion.","Exclusion equals proof"),
      c("ssd","The SSD must be corrupt because Windows cannot load without it.",false,"A system can normally enter firmware without an SSD.","OS-centric diagnosis")
    ],
    principle:"Change one variable at a time. Record the configuration of each test; unchanged behaviour narrows the field without proving every detached component healthy.",
    expertPrompt:"Choose one hypothesis that remains possible and one that has become less plausible. Justify both.",
    hint:"If symptoms persist with a component removed, does that prove it is good or only that it wasn't necessary for the symptom?"
  },
  {
    id:"thermal",title:"Don't create a second fault",phase:"Heatsink & reassembly",minutes:6,domain:"safety",
    observation:"During inspection the CPU heatsink was lifted, breaking the original thermal paste contact. The battery remains disconnected and no replacement paste has been applied.",
    question:"What is the safest next action before another power test?",
    choices:[
      c("flash","Briefly start the laptop without the heatsink; less than a minute cannot harm it.",false,"Modern exposed processor dies can heat rapidly; do not introduce an avoidable thermal risk.","Unsafe thermal assumption"),
      c("wipe","Clean old paste from only the heatsink and bolt it back without paste.",false,"Both contact faces need appropriate preparation and renewed thermal interface material.","Incomplete repaste"),
      c("repaste","Clean both contact faces, repaste, refit evenly and reconnect the fan.",true,"Correct. Reassembly safety is separate from solving the original white-flash fault."),
      c("glue","Use thermal adhesive to make the heatsink permanent and improve contact.",false,"Adhesive is not standard CPU thermal paste and can make future service damaging.","Thermal adhesive confusion")
    ],
    principle:"Repasting is mandatory when thermal contact is disturbed. It is maintenance, not evidence that past overheating caused this no-power symptom.",
    expertPrompt:"Explain the difference between safe reassembly and evidence that identifies the original failure.",
    hint:"What changed when the heatsink was removed, and what must be restored?"
  },
  {
    id:"water",title:"Tea damage and hidden uncertainty",phase:"Liquid-damage reasoning",minutes:7,domain:"reasoning",
    observation:"The laptop worked for months after a tea-spill repair. Photos show no obvious scorching or broad corrosion. The charge jack feels firm. No rail measurements under load are available.",
    question:"Which customer-facing assessment is accurate?",
    choices:[
      c("safe","There is no corrosion visible, so liquid exposure cannot explain the fault.",false,"Corrosion or contamination can hide beneath shielding, components or the PCB underside.","Visual absence equals healthy PCB"),
      c("guarantee","It is definitely the original spill and the board is beyond economical repair.",false,"Plausible history isn't proof of causation or repair cost.","Unproven causation"),
      c("inspect","The firm socket rules out all DC-input electronics; replace the motherboard.",false,"Fit cannot assess solder joints, input MOSFETs or voltage rails.","Mechanical check proves electronics"),
      c("cautious","Suspect a board/startup fault; spill involvement and failed part are unproven.",true,"Correct. Give a bounded hypothesis, confidence and escalation plan.")
    ],
    principle:"Prior liquid exposure raises suspicion without proving cause. Escalate powered board-level testing to a properly equipped, competent technician.",
    expertPrompt:"Draft an owner-friendly explanation of why a firm plug and a visually clean board do not close the case.",
    hint:"Can a fault be underneath the board or inside an electrical component?"
  },
  {
    id:"data",title:"Return value, not just parts",phase:"Data protection & handover",minutes:8,domain:"data",
    observation:"The owner wants their files. The removed storage is a 512 GB M-key M.2 2280 NVMe SSD. You can connect it to a second machine using a compatible NVMe-to-USB adapter.",
    question:"Which recovery and ownership sequence is appropriate?",
    choices:[
      c("wipe","Test resale value by formatting the SSD, then ask what files were important.",false,"Formatting before consent can make recovery much harder.","Data loss through curiosity"),
      c("consent","Obtain consent, use an NVMe reader, preserve files and check encryption before reuse.",true,"Correct. Preserve confidentiality and let the owner validate restored data."),
      c("sata","Insert it into an old 2.5-inch SATA bay because both are SSDs.",false,"M.2 NVMe and SATA are different connectors/protocols.","Storage protocol confusion"),
      c("free","Assume that buying the SSD or receiving it in a trade allows browsing old private files without further permission.",false,"Receiving parts does not waive the customer's privacy and data-recovery expectations.","Ownership versus data confidentiality")
    ],
    principle:"An adapter must support NVMe (not M.2 SATA-only). Encryption may require the owner's BitLocker recovery key. Do not initialise, format or erase a customer drive without explicit authorisation.",
    expertPrompt:"Write a handover note for an SSD that remains encrypted, including what you have not done.",
    hint:"Data belongs to the customer; transfer or trade of the physical device doesn't grant permission to read everything."
  }
];

export const transferCases:Transfer[] = [
  {
    id:"screen",situation:"Another laptop stays powered on, keyboard lights respond, and a known-good external display shows a desktop while the internal panel is dark.",
    question:"Which initial fault family fits best?",
    choices:[
      c("os","Reinstall Windows to fix an assumed graphics driver or bootloader issue, despite the visible external desktop.",false,"The visible desktop already proves Windows has loaded."),
      c("battery","Complete external power failure; replace the battery.",false,"The laptop stays powered and operates externally."),
      c("display","Inspect the internal display path, backlight, panel and cable before ordering parts.",true,"Correct: this is different from a momentary power-flash case."),
      c("nvme","NVMe SSD failure; an external screen depends on an SSD.",false,"The external desktop disproves that claim.")
    ],
    principle:"Distinct symptom clusters deserve different hypotheses. Do not reuse a diagnosis just because both machines have a dark screen."
  },
  {
    id:"storage",situation:"A laptop displays its vendor logo and firmware setup. The original internal SSD isn't detected, but a known-good compatible drive is.",
    question:"What is the best next action if the original drive holds irreplaceable data?",
    choices:[
      c("format","Format the original SSD on a different laptop to see if changing the filesystem fixes firmware detection.",false,"Formatting cannot fix detection and risks files."),
      c("replace","Declare CPU failure because the SSD does not appear.",false,"Firmware already executed."),
      c("erase","Securely erase the original SSD to verify its controller.",false,"Destructive and contrary to preserving the owner's files."),
      c("protect","Preserve the SSD, document detection and seek non-destructive data recovery.",true,"Correct: this is a storage/data branch after POST.")
    ],
    principle:"A device that reaches firmware is a different diagnostic starting point from a laptop that powers off before POST."
  },
  {
    id:"charging",situation:"A 20 V adapter reads normally on an unloaded multimeter. The laptop fails on it but boots every time on a verified equivalent supply with matching tip, ID and polarity.",
    question:"What is the strongest conclusion?",
    choices:[
      c("adapter","Suspect the original supply under load; record the matched-substitute result.",true,"Correct. The well-controlled comparison narrows the external power path."),
      c("cpu","The CPU is failing and needs replacing.",false,"The same CPU boots on a matched supply."),
      c("windows","Windows installation is corrupt because the battery was charged.",false,"Power-source-dependent startup is not evidence of OS corruption."),
      c("all","The laptop's motherboard and charging system are now guaranteed healthy under every future condition; stop diagnostics.",false,"The test does not certify every board component.")
    ],
    principle:"A verified *compatible* substitute is stronger evidence than an unloaded voltage reading. Still state the limits."
  }
];

export const sources = [
  {title:"Dell: distinguish no power, no POST, no video and no boot",url:"https://www.dell.com/support/kbdoc/en-ap/000125609/resolve-no-power-no-post-no-boot-or-no-video-issues-with-your-dell-computer",task:"After reading, write how an LED flash differs from a completed POST."},
  {title:"iFixit: Laptop Won't Turn On",url:"https://www.ifixit.com/Troubleshooting/PC_Laptop/Laptop+Will+Not+Turn+On/505262",task:"Find one reversible test and describe what it could falsify."},
  {title:"iFixit: How to Repaste a Laptop",url:"https://www.ifixit.com/Guide/How+to+Repaste+a+Laptop/158549",task:"Locate where the heatsink becomes unsafe to power on without renewing thermal compound."},
  {title:"Microsoft: Find your BitLocker recovery key",url:"https://support.microsoft.com/en-us/windows/security/encryption/find-your-bitlocker-recovery-key",task:"Explain why moving an SSD to another PC might not reveal any files."}
] as const;

export function correctChoice(item: {choices:Choice[]}):Choice {
  const correct=item.choices.filter(ch=>ch.correct);
  if(correct.length!==1) throw new Error("Each case must have exactly one defensible best answer");
  return correct[0];
}
export function hasFinishedDecisions(history:DecisionHistory):boolean {
  return decisions.every(d=>history[d.id]?.selection===correctChoice(d).id);
}
export function firstPassRate(history:DecisionHistory):number {
  const tried=Object.keys(history).filter(id=>decisions.some(d=>d.id===id));
  if(!tried.length)return 0;
  return Math.round(tried.filter(id=>history[id]?.firstCorrect).length/tried.length*100);
}
export function tierFromHistory(history:DecisionHistory):LearningTier {
  const attempts=decisions.filter(d=>history[d.id]);
  if(attempts.length<2) return "investigator";
  const last=attempts.slice(-3);
  if(last.filter(d=>history[d.id]?.firstCorrect).length===last.length && last.length===3) return "expert";
  if(last.filter(d=>history[d.id]?.firstCorrect).length<=1 && last.length>=2) return "guided";
  return "investigator";
}
export function gradeTransfers(answers:Record<string,string>):{correct:number;total:number;missed:string[]} {
  const missed=transferCases.filter(t=>answers[t.id]!==correctChoice(t).id).map(t=>t.id);
  return {correct:transferCases.length-missed.length,total:transferCases.length,missed};
}
export function canMarkCapstonePractised(history:DecisionHistory,answers:Record<string,string>,handover:string):boolean {
  return hasFinishedDecisions(history) && gradeTransfers(answers).correct===transferCases.length && handover.trim().length>=140;
}
export function longestAnswerBias(items:{choices:Choice[]}[]):number{
  const total=items.length;
  const longestCorrect=items.filter(d=>{
    const max=Math.max(...d.choices.map(c=>c.text.length));
    return d.choices.find(c=>c.correct)?.text.length===max;
  }).length;
  return total?Math.round(longestCorrect/total*100):0;
}
