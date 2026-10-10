"use client";
import { useState } from "react";
import { CheckCircle2, RotateCcw, ShieldCheck, BrainCircuit } from "lucide-react";
import {initialAdaptiveRecord,nextAdaptiveRecord,pickAdaptive,labelDifficulty,type Difficulty} from "@/lib/learning/adaptive-difficulty";

type Challenge={scenario:string;choices:string[];answer:number;why:string};
const safety:Challenge[]=[
  {
    "scenario": "A donated laptop's touchpad is raised, the internal pack may be swollen, and the owner says it still boots. What is the safest intake decision?",
    "choices": [
      "Record the suspected battery fault and test only after removing the SSD.",
      "Stop active diagnostics pending appropriate battery-hazard handling and authorised custody.",
      "Use a compatible low-power charger to establish whether the pack is functional.",
      "Inspect the charging history before choosing whether to isolate the device."
    ],
    "answer": 1,
    "why": "A visibly altered chassis may indicate a compromised pack. Diagnostic convenience never overrides a lithium battery hazard."
  },
  {
    "scenario": "A ThinkPad RAM replacement is authorised, but you only have the retail model name and a generic teardown. What is the strongest preparation?",
    "choices": [
      "Use the generic guide for screws, then disconnect AC and proceed.",
      "Check a matching service manual and required battery isolation and ESD procedures before disassembly.",
      "Find a motherboard photograph with the same RAM configuration first.",
      "Ask the customer whether the laptop can boot and document a safe power state from that."
    ],
    "answer": 1,
    "why": "The exact service instructions and isolation conditions govern internal work; the off state is not always electrically isolated."
  },
  {
    "scenario": "In the simulator, a rail returns a low resistance reading with no matching board reference. Which is the most justified assessment?",
    "choices": [
      "A regulator short is likely because low resistance always indicates a defect.",
      "The result is inconclusive without circuit, meter/setup and normal impedance information.",
      "A failed charger is likely because the low impedance would collapse its output.",
      "The processor should be replaced before another meter test."
    ],
    "answer": 1,
    "why": "Some power rails legitimately show low resistance. Comparing to a wrong board reference is not evidence of a specific fault."
  },
  {
    "scenario": "A repair shop offers a customer-owned laptop that was never collected. What would you need before accepting it?",
    "choices": [
      "A dated stock write-off and a working charger.",
      "A documented authorised release and suitable data-handling agreement, not merely store-room possession.",
      "A demonstration that it no longer boots to the previous owner's desktop.",
      "Permission to remove any identifiable labels and sell only components."
    ],
    "answer": 1,
    "why": "Uncollected goods are not automatically the shop's property. Data and ownership duties remain."
  },
  {
    "scenario": "A donor authorises reuse of five business laptops; the serial list includes two under current lease. What is the immediate decision?",
    "choices": [
      "Accept all units but don't sell the leased laptops until the contract is checked.",
      "Require authority from the actual asset owner or lessor before taking custody of leased items.",
      "Accept only the chargers from the leased units because they are removable accessories.",
      "Record the lease as an exception after the donor signs a general transfer form."
    ],
    "answer": 1,
    "why": "A donor may manage devices without owning leased goods. Authority must precede transfer."
  },
  {
    "scenario": "A virtual repair note points to a failed adapter, but the battery casing is distorted. Which report best represents both findings?",
    "choices": [
      "Record the adapter as confirmed and investigate the battery in a later job.",
      "Document the probable supply issue separately and stop active repair pending battery safety assessment.",
      "Discard the adapter readings because battery swelling invalidates every external test.",
      "Continue with the spare adapter while minimising charging current."
    ],
    "answer": 1,
    "why": "A plausible electrical diagnosis never cancels an independent safety stop."
  }
];
const symptoms:Challenge[]=[
  {
    "scenario": "The firmware logo appears and then the laptop reports 'No bootable device'. Which is the most precise current failure stage?",
    "choices": [
      "A power-path issue because the operating system draws more current than firmware.",
      "A post-firmware no-boot problem requiring storage and boot-path checks.",
      "No POST because the OS never finished loading.",
      "An LCD problem because the error appears on the screen."
    ],
    "answer": 1,
    "why": "The logo and error show a successful display and at least part of firmware startup; boot handoff is failing."
  },
  {
    "scenario": "An external monitor displays the desktop, while the internal screen is black. What is the best next diagnostic direction?",
    "choices": [
      "Inspect the internal display/cable/illumination pathway without assuming the exact component.",
      "Replace the LCD immediately because the external GPU output works.",
      "Reinstall the graphics driver before verifying screen detection.",
      "Test the battery since external monitors tend to draw less from the laptop."
    ],
    "answer": 0,
    "why": "External video narrows the symptom family but not the specific internal display component."
  },
  {
    "scenario": "The keyboard lights, fans run and a manufacturer-specific LED fault pattern repeats without a firmware logo. Best working classification?",
    "choices": [
      "A no-POST investigation, interpreted using the exact platform's code guide.",
      "An SSD boot issue, because storage is involved in early firmware checks.",
      "No power, because POST cannot complete and the device repeatedly resets.",
      "A confirmed memory-chip failure based on common LED codes."
    ],
    "answer": 0,
    "why": "Power exists, but POST may not complete. Manufacturer codes require exact model mapping."
  },
  {
    "scenario": "A computer has no fan, LED or image. What observation should precede firmware or storage testing?",
    "choices": [
      "Whether a recovery USB has a visible boot sector.",
      "A controlled test with a verified compatible adapter and accessible power connection.",
      "A flashlight check for a faint internal display image.",
      "A storage SMART check from an external enclosure."
    ],
    "answer": 1,
    "why": "No sign of power makes external supply and connection checks the least invasive starting point."
  },
  {
    "scenario": "A laptop powers on intermittently; when it fails, a model-specific memory diagnostic code appears, while some attempts show a logo. How should you describe it?",
    "choices": [
      "Intermittent no-POST behaviour, noting the successful attempts and validated diagnostic code.",
      "A persistent no-boot condition because at least one logo was observed.",
      "A likely display-cable failure because the logo does not always appear.",
      "A USB-C charger fault because intermittent power always suggests negotiation."
    ],
    "answer": 0,
    "why": "Do not flatten intermittent evidence into a single permanent state. Validate the model-specific code."
  },
  {
    "scenario": "Firmware sometimes sees the SSD and a controlled spare drive is always detected in the same socket. What is supported?",
    "choices": [
      "The original storage device or its detection path is implicated; preserve it for further authorised diagnosis.",
      "The original SSD controller is definitively broken and safe to wipe.",
      "The motherboard is conclusively faulty because the spare drive changes boot order.",
      "The current Windows installation is proven corrupt and should be reset."
    ],
    "answer": 0,
    "why": "A controlled comparison implicates the original drive/detection family but cannot prove a precise component failure."
  }
];

export default function DetectiveMiniGames({mode}:{mode:"safety"|"symptoms"}) {
  const bank=mode==="safety"?safety:symptoms;
  const challenges=bank.map((q,i)=>({...q,id:mode+"-"+i,level:(i<2?1:i<4?2:3) as Difficulty}));
  const [adaptive,setAdaptive]=useState(initialAdaptiveRecord);
  const [seen,setSeen]=useState<string[]>([]);
  const [attempts,setAttempts]=useState<Record<string,number>>({});
  const [revealed,setRevealed]=useState(false);
  const [finished,setFinished]=useState(false);
  const [correctCount,setCorrectCount]=useState(0);
  const question=pickAdaptive(challenges,adaptive.level,seen)??challenges[0];
  const selected=attempts[question.id];
  const correct=selected===question.answer;
  function pick(i:number){if(revealed)return;setAttempts(prev=>({...prev,[question.id]:i}));setRevealed(true);}
  function next(){const level=nextAdaptiveRecord(adaptive,correct);setAdaptive(level);setCorrectCount(v=>v+(correct?1:0));setSeen(prev=>[...prev,question.id]);setRevealed(false);if(seen.length+1===challenges.length)setFinished(true);}
  function restart(){setAdaptive(initialAdaptiveRecord());setSeen([]);setAttempts({});setRevealed(false);setFinished(false);setCorrectCount(0);}
  return <section aria-label={mode==="safety"?"Adaptive safety judgement practice":"Adaptive symptom reasoning practice"} className="rounded-2xl border border-violet-300/30 bg-[#1d1b36] p-5">
    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-200">{mode==="safety"?<ShieldCheck size={17}/>:<BrainCircuit size={17}/>} {mode==="safety"?"Safety judgement":"Fault-stage reasoning"}</p>
    <p className="mt-2 text-sm text-slate-200">Choose the <em>best-supported</em> response, not merely a technically possible one. Two consecutive correct answers increase complexity; two misses shift towards guided reasoning. First-attempt accuracy is tracked, not only final retries.</p>
    {finished?<div className="mt-5 rounded-xl border border-violet-300/40 p-5"><CheckCircle2 className="text-emerald-300"/><h3 className="mt-2 text-xl font-bold">{correctCount}/{challenges.length} first-attempt decisions</h3><p className="mt-2 text-sm">Finishing challenge tier: {labelDifficulty(adaptive.level)}. This measures practice in a simulator, not a professional qualification.</p><button type="button" onClick={restart} className="mt-4 rounded-lg bg-violet-200 px-4 py-2 font-bold text-slate-900"><RotateCcw size={15} className="mr-1 inline"/> Practise again</button></div>:
    <div className="mt-5"><p className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-violet-200"><span>CASE {seen.length+1} OF {challenges.length}</span><span>{labelDifficulty(question.level)}</span></p><div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-violet-300" style={{width:((seen.length+1)/challenges.length*100)+"%"}}/></div><h3 className="mt-4 text-lg font-bold">{question.scenario}</h3>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{question.choices.map((option,i)=><button type="button" key={option} disabled={revealed} onClick={()=>pick(i)} className={"min-h-20 rounded-lg border p-3 text-left text-sm transition disabled:cursor-default "+(selected===i?(correct?"border-emerald-300 bg-emerald-500/20":"border-amber-300 bg-amber-500/20"):"border-slate-600 hover:border-violet-300")}>{option}</button>)}</div>
      {revealed?<div role="status" className="mt-4 rounded-lg border border-violet-400/30 p-4 text-sm"><strong>{correct?"Best-supported decision.":"Not the most defensible decision."}</strong><p className="mt-2">{question.why}</p><button type="button" onClick={next} className="mt-3 rounded-lg bg-violet-200 px-4 py-2 font-bold text-slate-900">{seen.length+1===challenges.length?"Review results":"Next case →"}</button></div>:null}
    </div>}
  </section>;
}