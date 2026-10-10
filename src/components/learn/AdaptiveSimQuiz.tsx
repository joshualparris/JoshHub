"use client";
import { useEffect, useState } from "react";
import { adapt, initialAdaptiveState, levelLabel, parseAdaptiveState, pickChallenge, type AdaptiveState, type Challenge } from "@/lib/learning/adaptive";
import { simChallenges } from "@/lib/learning/simChallenges";

export default function AdaptiveSimQuiz({simulator,dark=false}:{simulator:"laptop"|"cafe";dark?:boolean}) {
  const key="joshhub:simulation:adaptive:v1:"+simulator;
  const [state,setState]=useState<AdaptiveState>(initialAdaptiveState());
  const [ready,setReady]=useState(false);
  const [selected,setSelected]=useState<number|null>(null);
  const [reason,setReason]=useState("");
  const [feedback,setFeedback]=useState<{item:Challenge;correct:boolean;level:number}|null>(null);
  const [saveError,setSaveError]=useState("");
  useEffect(()=>{
    try {setState(parseAdaptiveState(localStorage.getItem(key)));}
    catch{setSaveError("Browser progress cannot be loaded.");}
    setReady(true);
  },[key]);
  const challenge=pickChallenge(simChallenges[simulator],state);
  const item=feedback?.item??challenge;
  const offset=item?[...item.id].reduce((n,c)=>n+c.charCodeAt(0),0)%3:0;
  const choices=item?[0,1,2].map(i=>(i+offset)%3):[];
  function check(){
    if(!item||selected===null||feedback||reason.trim().length<20)return;
    const correct=selected===item.answer;
    const next=adapt(state,correct,item.id);
    setState(next);setFeedback({item,correct,level:next.level});
    try{localStorage.setItem(key,JSON.stringify(next));setSaveError("");}
    catch{setSaveError("Your difficulty will reset if browser storage is unavailable.");}
  }
  const panel=dark?"border-slate-600 bg-slate-900 text-slate-100":"border-stone-300 bg-white text-stone-900";
  return <section id="adaptive-simulation" aria-label="Adaptive skills challenge" className={"space-y-4 rounded-2xl border p-5 "+panel}>
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Adaptive mastery challenge</h2>
      <p className="text-sm">Starts at Practitioner. Three fresh correct decisions raise difficulty; two mistakes in three lower it. Completed questions are never reused to award mastery.</p>
      <p className="text-sm" aria-live="polite">Level <strong>{levelLabel(state.level)}</strong> · {state.correct}/{state.attempts} correct decisions</p>
      {saveError?<p role="alert">{saveError}</p>:null}
    </div>
    {!ready?<p>Loading practice…</p>:!item?<p role="status">All unseen questions in this simulator have been attempted. You can continue the hands-on simulation; more adaptive cases will need to be added for further practice.</p>:
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase">{levelLabel(item.level)} scenario</p>
      <h3 className="text-lg font-semibold">{item.question}</h3>
      <label className="block space-y-1">
        <span className="text-sm">Explain the trade-off first (at least 20 characters; your draft is not scored or saved)</span>
        <textarea rows={3} disabled={Boolean(feedback)} className="w-full rounded-lg border border-slate-400 bg-transparent p-3" value={reason} onChange={e=>setReason(e.target.value)}/>
      </label>
      <fieldset disabled={Boolean(feedback)} className="space-y-2">
        <legend className="font-medium">Choose the best-supported decision</legend>
        {choices.map(i=><label key={i} className="flex items-start gap-2 rounded-lg border border-slate-500/40 p-3">
          <input type="radio" checked={selected===i} name={"sim-adaptive-"+simulator} onChange={()=>setSelected(i)}/>
          <span>{item.options[i]}</span>
        </label>)}
      </fieldset>
      {!feedback?<button type="button" className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-40" onClick={check} disabled={selected===null||reason.trim().length<20}>Check decision</button>:
        <div className="space-y-3" role="status">
          <p><strong>{feedback.correct?"Correct.":"Not quite."}</strong> {item.explanation}</p>
          <p>Best response: {item.options[item.answer]}</p>
          <p>Next level: <strong>{levelLabel(feedback.level as 1|2|3)}</strong></p>
          <button type="button" className="rounded-lg border border-current px-5 py-3" onClick={()=>{setSelected(null);setReason("");setFeedback(null);}}>Next challenge →</button>
        </div>}
    </div>}
    <p className="text-xs">This optional practice does not replace simulated mission gates, required safety checks or supervised real-world competency assessment.</p>
  </section>;
}
