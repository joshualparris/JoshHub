"use client";
import { useState } from "react";
import { CheckCircle2, RotateCcw, ShieldCheck, BrainCircuit } from "lucide-react";

type Challenge={scenario:string;choices:string[];answer:number;why:string};
const safety:Challenge[]=[
{scenario:"A laptop battery is swollen and the touchpad is lifting.",choices:["Stop, isolate safely and seek a suitable specialist pathway","Press the battery flat and continue"],answer:0,why:"Swollen lithium-ion packs are not routine repair items. Do not press, puncture, heat or charge them."},
{scenario:"You need to find out whether a RAM module is present.",choices:["Open the computer while connected to AC","Read the exact service manual and isolate power before opening"],answer:1,why:"Disassembly is model-specific and internal batteries can remain energised even after removing AC."},
{scenario:"A technician sets a multimeter to Ω and touches a powered board.",choices:["Safe because Ω uses a tiny current","Unsafe: isolate appropriate circuits before resistance or continuity measurements"],answer:1,why:"An ohmmeter is not for live measurements. The main course provides only virtual readings."},
{scenario:"A donor says a customer never collected their SSD.",choices:["Treat it as free","Check documented ownership, consent and data obligations"],answer:1,why:"Custody does not establish transfer authority. Original owner data must be protected."},
{scenario:"You find a detailed schematic labelled with your laptop's retail model.",choices:["Confirm the motherboard silkscreen and revision before using it","Assume it fits all units with the same model name"],answer:0,why:"Manufacturers can use multiple board platforms and revisions under one retail family."},
{scenario:"You finish a simulated diagnosis without opening real equipment.",choices:["Explain the tested evidence and remaining uncertainty","Claim certified motherboard-level repair competence"],answer:0,why:"The simulation teaches reasoning, not certification or a guarantee of real-world competence."}
];
const symptoms:Challenge[]=[
{scenario:"No status LED, fan, display or other sign of life.",choices:["No boot","No power","No video","No POST"],answer:1,why:"There is no observed power activity; investigate external supply and power state first."},
{scenario:"Keyboard lights flash a diagnostic pattern and there is no firmware logo.",choices:["No POST","No video","No boot","No power"],answer:0,why:"Signs of power exist, but firmware self-tests may be failing. Use the model-specific LED guide."},
{scenario:"Manufacturer logo appears, then ‘No bootable device’.",choices:["No power","No video","No POST","No boot"],answer:3,why:"Firmware displays a logo, but the OS handoff fails."},
{scenario:"Fans spin and an external monitor shows a desktop; internal panel is black.",choices:["No video on internal display","No boot","No power","No POST"],answer:0,why:"System boot and external video are functioning; focus on internal display path."},
{scenario:"A firmware boot menu opens correctly, but Windows won't start.",choices:["No power","No boot","No video","No POST"],answer:1,why:"A functional firmware screen shows the device has powered and displayed enough to isolate a boot-stage problem."},
{scenario:"You hear Windows sign-in sounds and Caps Lock responds, but the built-in screen remains dark.",choices:["No POST","No power","No boot","No internal video"],answer:3,why:"Audible/keyboard signs of a functioning system make the display path a leading suspect."}
];

export default function DetectiveMiniGames({mode}:{mode:"safety"|"symptoms"}) {
  const challenges=mode==="safety"?safety:symptoms;
  const [position,setPosition]=useState(0);
  const [attempts,setAttempts]=useState<Record<number,number>>({});
  const [revealed,setRevealed]=useState(false);
  const [finished,setFinished]=useState(false);
  const question=challenges[position];
  const selected=attempts[position];
  const correct=selected===question.answer;
  const score=challenges.filter((q,i)=>attempts[i]===q.answer).length;
  function pick(i:number){setAttempts(old=>({...old,[position]:i}));setRevealed(true);}
  function next(){if(position===challenges.length-1)setFinished(true);else{setPosition(p=>p+1);setRevealed(false);}}
  function again(){setPosition(0);setAttempts({});setRevealed(false);setFinished(false);}
  return <section aria-label={mode==="safety"?"Safety judgement game":"Symptom sorter game"} className="rounded-2xl border border-violet-300/30 bg-[#1d1b36] p-5">
    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-200">{mode==="safety"?<ShieldCheck size={17}/>:<BrainCircuit size={17}/>} {mode==="safety"?"Mini game · Safe or stop?":"Mini game · Symptom sorter"}</p>
    <p className="mt-2 text-sm text-slate-200">{mode==="safety"?"Decide what a responsible technician does next.":"Match each observation to the correct *stage of failure*."} Six fast scenarios, immediate explanations and unlimited retries.</p>
    {finished?<div className="mt-5 rounded-xl border border-violet-300/40 p-5"><CheckCircle2 className="text-emerald-300"/><h3 className="mt-2 text-2xl font-bold">{score}/6 on this run</h3><p className="mt-2 text-sm">{score===6?"Excellent classification and judgement.":"Read the explanations and repeat to strengthen the skill."}</p><button type="button" onClick={again} className="mt-4 rounded-lg bg-violet-200 px-4 py-2 font-bold text-slate-900"><RotateCcw size={15} className="mr-1 inline"/> Try again</button></div>:
    <div className="mt-5"><p className="text-xs font-semibold text-violet-200">QUESTION {position+1} OF {challenges.length}</p><div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-violet-300" style={{width:((position+1)/challenges.length*100)+"%"}}/></div><h3 className="mt-4 text-lg font-bold">{question.scenario}</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.choices.map((choice,i)=><button type="button" key={choice} disabled={revealed} onClick={()=>pick(i)} className={"rounded-lg border p-3 text-left text-sm transition disabled:cursor-not-allowed "+(selected===i?(correct?"border-emerald-300 bg-emerald-500/20":"border-amber-300 bg-amber-500/20"):"border-slate-600 hover:border-violet-300")}>{choice}</button>)}</div>
      {revealed?<div role="status" className="mt-4 rounded-lg border border-violet-400/30 bg-violet-500/10 p-3 text-sm"><strong>{correct?"That's right.":"A useful mistake."}</strong> {question.why}<button type="button" onClick={next} className="mt-3 block rounded-lg bg-violet-200 px-4 py-2 font-bold text-slate-950">{position===challenges.length-1?"See results":"Next scenario →"}</button></div>:null}
    </div>}
  </section>;
}
