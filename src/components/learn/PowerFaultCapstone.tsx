"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, ClipboardList, Download, Headphones, RotateCcw, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { canMarkCapstonePractised, correctChoice, decisions, firstPassRate, gradeTransfers, hasFinishedDecisions, powerPath, sources, tierFromHistory, transferCases, type DecisionHistory } from "@/lib/learning/power-fault-capstone";

type Notebook = {
  history:DecisionHistory;
  notes:Record<string,string>;
  transfer:Record<string,string>;
  handover:string;
  reviewedAt?:string;
};
const KEY="joshhub-power-fault-capstone-v1";
const INITIAL:Notebook={history:{},notes:{},transfer:{},handover:""};
const button="rounded-lg border border-slate-500 px-3 py-2 text-sm font-medium transition hover:border-cyan-300 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300";
const warning="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-amber-100";
const phasePath:Record<string,number>= {intake:0,stage:3,charger:0,meter:1,isolate:3,thermal:3,water:2,data:4};

function readNotebook():Notebook {
  try {
    const item=localStorage.getItem(KEY);
    if(!item) return INITIAL;
    const parsed:unknown=JSON.parse(item);
    if(!parsed || typeof parsed!=="object")return INITIAL;
    const value=parsed as Partial<Notebook>;
    return {
      history:value.history && typeof value.history==="object"?value.history:{},
      notes:value.notes && typeof value.notes==="object"?value.notes:{},
      transfer:value.transfer && typeof value.transfer==="object"?value.transfer:{},
      handover:typeof value.handover==="string"?value.handover:"",
      reviewedAt:typeof value.reviewedAt==="string"?value.reviewedAt:undefined
    };
  } catch{return INITIAL;}
}
function futureDay(day:number):string{
  const next=new Date();next.setDate(next.getDate()+day);
  return next.toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"});
}

export default function PowerFaultCapstone(){
  const [notebook,setNotebook]=useState<Notebook>(INITIAL);
  const [ready,setReady]=useState(false);
  const [step,setStep]=useState(0);
  const [showSources,setShowSources]=useState(false);
  const [speaking,setSpeaking]=useState(false);
  const [status,setStatus]=useState("");
  const [reviewPrompt,setReviewPrompt]=useState(false);
  useEffect(()=>{setNotebook(readNotebook());setReady(true);},[]);
  useEffect(()=>{
    if(!ready)return;
    try{localStorage.setItem(KEY,JSON.stringify(notebook));}catch{setStatus("Browser storage is unavailable. Export your notes so you do not lose them.");}
  },[notebook,ready]);
  useEffect(()=>()=>{if(typeof window!=="undefined"&&"speechSynthesis" in window)window.speechSynthesis.cancel();},[]);

  const current=decisions[step];
  const answer=notebook.history[current.id];
  const selected=current.choices.find(c=>c.id===answer?.selection);
  const solved=answer?.selection===correctChoice(current).id;
  const completed=decisions.filter(d=>notebook.history[d.id]?.selection===correctChoice(d).id).length;
  const tier=tierFromHistory(notebook.history);
  const transferred=gradeTransfers(notebook.transfer);
  const readyToFinish=canMarkCapstonePractised(notebook.history,notebook.transfer,notebook.handover);

  function choose(id:string) {
    if(solved) return;
    const choice=current.choices.find(c=>c.id===id);
    if(!choice)return;
    setNotebook(previous=>{
      const prior=previous.history[current.id];
      return {
        ...previous,
        reviewedAt:undefined,
        history:{
          ...previous.history,
          [current.id]:{
            selection:id,
            tries:(prior?.tries??0)+1,
            firstCorrect:prior?.firstCorrect??choice.correct,
            explanation:choice.feedback
          }
        }
      };
    });
  }

  function speakCurrent(){
    if(typeof window==="undefined"||!("speechSynthesis" in window)){setStatus("Speech is not supported in this browser. The full transcript is above.");return;}
    window.speechSynthesis.cancel();
    if(speaking){setSpeaking(false);return;}
    const content=current.title+". Observation: "+current.observation+". Question: "+current.question;
    const u=new SpeechSynthesisUtterance(content);u.lang="en-AU";u.rate=.88;
    u.onend=()=>setSpeaking(false);u.onerror=()=>setSpeaking(false);setSpeaking(true);window.speechSynthesis.speak(u);
  }

  function exportNotebook(){
    if(typeof window==="undefined")return;
    const lines=[
      "JOSHHUB / POWER-FAULT CAPSTONE / SIMULATED LEARNING RECORD",
      "Exported: "+new Date().toLocaleString("en-AU"),"Not a certificate or real customer's report.","",
      ...decisions.flatMap(d=>{
        const a=notebook.history[d.id];const choice=d.choices.find(c=>c.id===a?.selection);
        return [d.title,
          "Final choice: "+(choice?.text??"Not attempted"),
          "First-attempt correct: "+(a?.firstCorrect?"yes":"no"),
          "Attempts: "+(a?.tries??0),
          "Reasoning note: "+(notebook.notes[d.id]||"(not recorded)"),
          "Principle: "+d.principle,""];
      }),
      "TRANSFER CASES",
      ...transferCases.map(t=>t.id+": "+(t.choices.find(c=>c.id===notebook.transfer[t.id])?.text??"Not attempted")),
      "FINAL OWNER-FRIENDLY HANDOVER",notebook.handover,
      "Evidence first. Do not overclaim faults or use real unverified test points."
    ];
    const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download="power-fault-capstone-notes.txt";a.click();URL.revokeObjectURL(url);
  }

  return <section aria-labelledby="advanced-power-title" className="rounded-2xl border border-cyan-400/45 bg-gradient-to-b from-[#0c2b36] to-slate-950 p-4 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.19em] text-emerald-300">Advanced capstone · new applied practice · 55 min</p>
        <h2 id="advanced-power-title" className="mt-2 text-2xl font-black text-white sm:text-3xl">The one-flash laptop: evidence under uncertainty</h2>
        <p className="mt-3 text-sm leading-7 text-slate-200">A fictionalised, anonymous laptop case inspired by ordinary repair-bench lessons. Eight decisions, realistic trade-offs, adaptive hints, three unseen transfer cases and a written handover. The goal is <strong>defensible reasoning</strong>, not guessing a repair.</p>
      </div>
      <div className="rounded-xl border border-cyan-400/30 bg-slate-900 p-3 text-sm"><span className="block text-slate-400">Decisions resolved</span><strong className="text-xl text-white">{completed}/8</strong><span className="mt-1 block text-xs text-slate-300">{ready?"Autosaves on this browser":"Loading…"}</span></div>
    </div>
    <p className={"mt-5 text-sm leading-6 "+warning}><ShieldCheck className="mr-2 inline" size={18}/> <strong>Simulated teaching only.</strong> Do not perform live motherboard tests, use resistance mode on powered circuits, or interpret fictional readings as manufacturer specs. Damaged/swollen batteries, wet boards and uncertain mains hazards are stop-work conditions. Protect customer data.</p>

    <div className="mt-6 rounded-xl border border-slate-600 bg-slate-900/80 p-4">
      <h3 className="text-base font-bold">How far does the evidence travel?</h3>
      <p className="mt-1 text-xs text-slate-300">Conceptual sequence, not a circuit schematic. Highlighting follows your current investigation.</p>
      <div className="mt-4 flex flex-wrap items-stretch gap-2" aria-label="Conceptual laptop startup path">
        {powerPath.map((part,i)=><div key={part.name} className="flex min-w-[125px] flex-1 items-center gap-2">
          <div className={"h-full w-full rounded-lg border p-3 "+(i===phasePath[current.id]?"border-cyan-300 bg-cyan-300/20":"border-slate-600 bg-slate-950")}>
            <span className="block text-[10px] font-semibold text-cyan-200">STAGE {i+1}</span>
            <strong className="mt-1 block text-xs">{part.name}</strong>
            <p className="mt-1 text-[11px] leading-5 text-slate-300">{part.detail}</p>
          </div>{i<powerPath.length-1?<ArrowRight className="hidden shrink-0 text-cyan-300 md:block" size={17}/>:null}
        </div>)}
      </div>
    </div>

    <div className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold">Investigation decision {step+1} of {decisions.length}</h3>
        <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200">Mode: {tier==="guided"?"Guided support":tier==="expert"?"Expert transfer":"Investigator"}</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1 sm:grid-cols-8" aria-label="Case phases">
        {decisions.map((d,i)=><button type="button" key={d.id} onClick={()=>{setStep(i);setStatus("");}} aria-label={"Open decision "+(i+1)+": "+d.title} aria-current={step===i?"step":undefined}
          className={"min-h-10 rounded-md border text-xs font-bold "+(step===i?"border-cyan-300 bg-cyan-400/25":notebook.history[d.id]?.selection===correctChoice(d).id?"border-emerald-500/60 bg-emerald-400/10 text-emerald-100":"border-slate-600 bg-slate-900 text-slate-300")}>{i+1}{notebook.history[d.id]?.selection===correctChoice(d).id?" ✓":""}</button>)}
      </div>

      <article className="mt-4 rounded-xl border border-slate-600 bg-slate-900/85 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-widest text-cyan-200">{current.phase} · {current.minutes} min · {current.domain}</p>
          <button type="button" className={button} onClick={speakCurrent}>{speaking?<VolumeX className="mr-1 inline" size={16}/>:<Volume2 className="mr-1 inline" size={16}/>} {speaking?"Stop audio":"Listen to case"}</button></div>
        <h4 className="mt-3 text-xl font-bold">{current.title}</h4>
        <div className="mt-4 rounded-xl border-l-4 border-amber-300 bg-amber-300/10 p-4"><p className="text-[11px] font-bold uppercase text-amber-200">Evidence disclosed so far</p><p className="mt-2 text-sm leading-7">{current.observation}</p></div>
        <p className="mt-5 text-base font-semibold leading-7">{current.question}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2" role="group" aria-label={"Choices for "+current.title}>
          {current.choices.map((choice,i)=><button type="button" key={choice.id} onClick={()=>choose(choice.id)} disabled={solved}
            aria-pressed={answer?.selection===choice.id} className={"min-h-24 rounded-xl border p-3 text-left text-sm leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed "+(answer?.selection===choice.id?choice.correct?"border-emerald-400 bg-emerald-400/15":"border-amber-400 bg-amber-300/10":"border-slate-600 bg-slate-950/60 hover:border-cyan-300")}>
            <span className="mr-2 font-bold text-cyan-200">{String.fromCharCode(65+i)}.</span>{choice.text}
          </button>)}
        </div>
        {selected?<div className={"mt-4 rounded-xl border p-4 text-sm leading-7 "+(selected.correct?"border-emerald-400/50 bg-emerald-400/10":"border-amber-400/50 bg-amber-400/10")} role="status" aria-live="polite">
          <strong>{selected.correct?"Best-supported choice.":"Reconsider this inference."}</strong> {selected.feedback}
          {!selected.correct?<p className="mt-2"><strong>Misconception:</strong> {selected.misconception}. You can retry, but your first-attempt result remains recorded.</p>:<p className="mt-2"><strong>Underlying principle:</strong> {current.principle}</p>}
        </div>:null}
        {tier==="guided"&&!solved?<div className="mt-3 rounded-lg border border-sky-300/30 bg-sky-300/10 p-3 text-sm"><strong>Guided hint:</strong> {current.hint}</div>:null}
        {solved?<div className="mt-4 space-y-2">
          <label htmlFor="capstone-reasoning" className="block text-sm font-bold">Explain *why*, in your own words (not automatically graded)</label>
          <textarea id="capstone-reasoning" rows={3} value={notebook.notes[current.id]??""} onChange={e=>setNotebook(old=>({...old,notes:{...old.notes,[current.id]:e.target.value},reviewedAt:undefined}))}
            placeholder="State the observation, supported conclusion and one thing you cannot infer…" className="w-full rounded-lg border border-slate-500 bg-slate-950 p-3 text-sm text-white"/>
          {tier==="expert"?<p className="text-sm text-cyan-100"><strong>Expert extension:</strong> {current.expertPrompt}</p>:null}
        </div>:null}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0} className={button+" disabled:opacity-40"}>Previous decision</button>
          <button type="button" onClick={()=>{setStep(Math.min(decisions.length-1,step+1));setStatus("");}} disabled={!solved||step===decisions.length-1} className={button+" disabled:opacity-40"}>Next decision <ArrowRight size={14} className="ml-1 inline"/></button>
        </div>
      </article>
    </div>

    <section className="mt-6 rounded-xl border border-slate-600 bg-slate-900/80 p-4 sm:p-6" aria-label="Transfer assessment">
      <div className="flex items-center gap-2"><ClipboardList className="text-emerald-200"/><h3 className="text-xl font-bold">Unseen transfer assessment</h3></div>
      <p className="mt-2 text-sm leading-6 text-slate-300">Three new symptoms. The correct response is not always the longest option. These test whether you can apply the approach beyond the one-flash example.</p>
      <div className="mt-5 space-y-6">
        {transferCases.map((t,i)=>{const chosen=t.choices.find(c=>c.id===notebook.transfer[t.id]);return <fieldset key={t.id} className="rounded-xl border border-slate-700 p-4">
          <legend className="px-1 text-xs font-bold uppercase text-cyan-200">Transfer {i+1}</legend>
          <p className="text-sm leading-6 text-slate-200">{t.situation}</p><p className="mt-3 font-semibold">{t.question}</p>
          <div className="mt-3 space-y-2">{t.choices.map((choice,j)=><label key={choice.id} className={"flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm "+(chosen?.id===choice.id?"border-cyan-300 bg-slate-800":"border-slate-600")}>
            <input type="radio" className="mt-1 accent-cyan-300" name={"transfer-"+t.id} checked={chosen?.id===choice.id} onChange={()=>setNotebook(old=>({...old,transfer:{...old.transfer,[t.id]:choice.id},reviewedAt:undefined}))}/>
            <span>{String.fromCharCode(65+j)}. {choice.text}</span>
          </label>)}</div>
          {chosen?<p role="status" className={"mt-2 text-sm leading-6 "+(chosen.correct?"text-emerald-200":"text-amber-200")}>{chosen.correct?"Correct. ":"Not yet. "}{chosen.feedback} {chosen.correct?t.principle:""}</p>:null}
        </fieldset>;})}
      </div>
    </section>

    <section className="mt-6 rounded-xl border border-slate-600 bg-slate-900/80 p-4 sm:p-6" aria-label="Client handover and reflection">
      <h3 className="text-xl font-bold">Final assessment: write the client handover</h3>
      <p className="mt-2 text-sm leading-7 text-slate-200">Write at least 140 characters: the reported symptom, what you tested and observed, which *fault family* remains plausible, what is not proven, what happens to the data and the next sensible step. No invented repairs or certification.</p>
      <label className="mt-4 block text-sm font-bold" htmlFor="capstone-handover">Your report</label>
      <textarea id="capstone-handover" rows={6} className="mt-2 w-full rounded-lg border border-slate-500 bg-slate-950 p-3 text-sm leading-7" placeholder="Reported symptom… Verified observations… Limits of conclusion… Data handling… Next action…"
        value={notebook.handover} onChange={e=>setNotebook(old=>({...old,handover:e.target.value,reviewedAt:undefined}))}/>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-cyan-400/30 bg-slate-950 p-3 text-sm">
          <h4 className="font-bold">Self-assessment rubric</h4>
          <p className="mt-1 leading-6">Check your report covers <strong>observation ≠ diagnosis</strong>, repeatable evidence, residual uncertainty, explicit data consent and appropriate escalation. A character counter cannot judge reasoning quality.</p>
        </div>
        <div className="rounded-lg border border-cyan-400/30 bg-slate-950 p-3 text-sm">
          <h4 className="font-bold">Diagnostic calibration</h4>
          <p className="mt-1 leading-6">First-pass accuracy on attempted steps: <strong>{firstPassRate(notebook.history)}%</strong>. Transfer accuracy: <strong>{transferred.correct}/{transferred.total}</strong>. Mistakes trigger support; three consecutive first-pass correct decisions unlock expert prompts.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={!readyToFinish} className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40" onClick={()=>{setNotebook(old=>({...old,reviewedAt:new Date().toISOString()}));setReviewPrompt(true);setStatus("Practice completed. Written reasoning still requires human review for competence.");}}>
          <CheckCircle2 size={17} className="mr-2 inline"/> Mark practice completed
        </button>
        <button type="button" className={button} onClick={exportNotebook}><Download size={16} className="mr-1 inline"/> Export learning notebook</button>
        <button type="button" className={button} onClick={()=>{if(window.confirm("Clear capstone decisions, transfer answers and written notes from this browser?")){setNotebook(INITIAL);setStep(0);setStatus("Capstone reset.");}}}><RotateCcw size={15} className="mr-1 inline"/> Reset practice</button>
      </div>
      <p className="mt-2 text-sm text-slate-300" role="status" aria-live="polite">{status||(!hasFinishedDecisions(notebook.history)?"Resolve all eight investigation decisions.":transferred.correct<transferred.total?"Complete all three transfer problems.":notebook.handover.trim().length<140?"Write the client handover to finish.":"All practice checks met. Submit when ready.")}</p>
      {notebook.reviewedAt?<div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4">
        <p className="font-semibold text-emerald-100"><CheckCircle2 className="mr-1 inline" size={17}/> Practice checkpoint recorded, not field certification</p>
        <p className="mt-2 text-sm leading-6">Revisit this case after <strong>1 day ({futureDay(1)})</strong>, <strong>3 days ({futureDay(3)})</strong> and <strong>7 days ({futureDay(7)})</strong>. Cover the explanations and first recall your own reasoning. Dates are guidance only; no notification has been scheduled.</p>
        {reviewPrompt?<p className="mt-2 text-xs text-emerald-100">Ask another technician to critique your written report against the rubric; do not treat the app's check as independent assessment.</p>:null}
      </div>:null}
    </section>

    <div className="mt-6 rounded-xl border border-slate-600 bg-slate-900/70 p-4">
      <button type="button" className="flex w-full items-center justify-between text-left font-bold" aria-expanded={showSources} onClick={()=>setShowSources(v=>!v)}>
        <span><BookOpen size={17} className="mr-2 inline"/> Watch, read and verify against real repair sources</span><span>{showSources?"Hide":"Show"}</span>
      </button>
      {showSources?<div className="mt-4 space-y-3">
        <p className="text-sm leading-6">These are general references, not a pinout or teardown for this fictional model. Each has a task: predict an answer before opening the resource, then compare your reasoning.</p>
        {sources.map(s=><div className="rounded-lg border border-slate-700 p-3" key={s.url}>
          <a className="font-semibold text-cyan-200 underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a>
          <p className="mt-1 text-sm text-slate-300">{s.task}</p>
        </div>)}
        <p className="text-sm leading-6"><Headphones size={16} className="mr-1 inline"/> Use the existing course's <strong>Media studio</strong> below for a genuine teardown video, original text-to-speech briefing and a repair-community podcast. Captions and availability depend on external providers.</p>
      </div>:null}
    </div>
    <p className="mt-5 text-xs leading-6 text-slate-400"><AlertTriangle size={14} className="mr-1 inline"/> Fictional composite case; no real customer identity, serial number, photographs, private repair notes or exact live voltage test points published. Training decisions and written reports are stored only in this browser until you export them.</p>
  </section>;
}
