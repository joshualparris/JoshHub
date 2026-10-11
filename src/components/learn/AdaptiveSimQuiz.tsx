"use client";
import {useEffect,useState} from "react";
import {adapt,initialAdaptiveState,levelLabel,parseAdaptiveState,pickChallenge,type AdaptiveState,type Challenge} from "@/lib/learning/adaptive";
import {simChallenges} from "@/lib/learning/simChallenges";
import {assessmentOutcome,combineReasoning,type DialogueResult} from "@/lib/learning/assessment-dialogue";

export default function AdaptiveSimQuiz({simulator,dark=false}:{simulator:"laptop"|"cafe";dark?:boolean}) {
  const key="joshhub:simulation:adaptive:v3:"+simulator;
  const [state,setState]=useState<AdaptiveState>(initialAdaptiveState());
  const [ready,setReady]=useState(false);
  const [selected,setSelected]=useState<number|null>(null);
  const [reason,setReason]=useState("");
  const [clarification,setClarification]=useState("");
  const [offset,setOffset]=useState(0);
  const [feedback,setFeedback]=useState<{item:Challenge;data:DialogueResult;finished:boolean;independent:boolean;nextLevel:number}|null>(null);
  const [usedHelp,setUsedHelp]=useState(false);
  const [grading,setGrading]=useState(false);
  const [gradingError,setGradingError]=useState("");
  const [saveError,setSaveError]=useState("");
  useEffect(()=>{
    try{setState(parseAdaptiveState(localStorage.getItem(key)));}
    catch{setSaveError("Browser progress cannot be loaded.");}
    setReady(true);
  },[key]);
  const challenge=pickChallenge(simChallenges[simulator],state);
  const item=feedback?.item??challenge;
  useEffect(()=>{setOffset(Math.floor(Math.random()*3));},[item?.id]);
  const choices=item?[0,1,2].map(i=>(i+offset)%3):[];
  const needsClarification=feedback?.data.status==="clarify" && !feedback.finished;
  const needsRevision=feedback?.data.status==="revise" && !feedback.finished;
  const button="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500";
  function recordOutcome(next:AdaptiveState){
    setState(next);
    try{localStorage.setItem(key,JSON.stringify(next));setSaveError("");}
    catch{setSaveError("Progress could not be saved on this device.");}
  }
  async function submit(isFollowUp=false){
    if(!item||grading || feedback?.finished || (isFollowUp?!clarification.trim():!reason.trim()))return;
    const responseText=isFollowUp?combineReasoning(reason,clarification):reason.trim();
    setGrading(true);setGradingError("");
    try{
      const response=await fetch("/api/learning/grade",{
        method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
        body:JSON.stringify({kind:"simulation",simulator,challengeId:item.id,selected,response:responseText})
      });
      const result=await response.json() as DialogueResult&{error?:string;precheck?:boolean};
      if(!response.ok){
        setGradingError(result.error??result.summary??"The grader is unavailable. No progress was recorded.");
        return;
      }
      if(!["pass","clarify","revise"].includes(result.status)){
        setGradingError("The grader returned an incomplete assessment. No progress was recorded.");return;
      }
      const outcome=assessmentOutcome(result,usedHelp||isFollowUp);
      let nextLevel=state.level;
      if(outcome.finished){
        // A tutored or revised response shows learning but is not independent first-attempt mastery.
        const next=adapt(state,outcome.independent,item.id);
        nextLevel=next.level;
        recordOutcome(next);
      }else {
        setUsedHelp(true);
      }
      if(isFollowUp){setReason(responseText);setClarification("");}
      setFeedback({item,data:result,finished:outcome.finished,independent:outcome.independent,nextLevel});
    }catch{
      setGradingError("Could not connect to the AI grader. Your answer was not scored.");
    }finally{setGrading(false);}
  }
  function next(){
    setSelected(null);setReason("");setClarification("");setFeedback(null);
    setUsedHelp(false);setGradingError("");
  }
  function skip(){
    if(!item||grading)return;
    const nextState=adapt(state,false,item.id);
    recordOutcome(nextState);
    next();
  }
  const panel=dark?"border-slate-600 bg-slate-900 text-slate-100":"border-stone-300 bg-white text-stone-900";
  return <section id="adaptive-simulation" aria-label="Adaptive skills challenge" className={"space-y-4 rounded-2xl border p-5 "+panel}>
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Adaptive mastery challenge</h2>
      <p className="text-sm">Explain what you would do in your own words. Creative, safe alternatives are welcome. AI will assess your reasoning and ask a focused follow-up when an important condition is missing.</p>
      <p className="text-sm" aria-live="polite">Level <strong>{levelLabel(state.level)}</strong> · {state.correct}/{state.attempts} independent first-attempt decisions</p>
      {saveError?<p role="alert">{saveError}</p>:null}
    </div>
    {!ready?<p>Loading practice…</p>:!item?<p role="status">You've attempted the available cases. You can continue the interactive simulation. New unseen challenges will be added for further practice.</p>:
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase">{levelLabel(item.level)} scenario</p>
        <h3 className="text-lg font-semibold">{item.question}</h3>
        <label className="block space-y-2">
          <span className="font-semibold">Your plan and reasoning</span>
          <span className="block text-sm opacity-80">A short, insightful answer is fine. Say what you'd do and what would need checking. There is no word minimum.</span>
          <textarea rows={4} maxLength={2400} disabled={grading||Boolean(feedback?.finished)||Boolean(needsClarification)}
            className="w-full rounded-lg border border-slate-400 bg-transparent p-3"
            placeholder="I would… because…"
            value={reason} onChange={e=>{setReason(e.target.value);setGradingError("");if(needsRevision)setFeedback(null);}}/>
        </label>
        <fieldset disabled={grading||Boolean(feedback?.finished)||Boolean(needsClarification)} className="space-y-2">
          <legend className="text-sm font-medium">Optional: compare your answer with these approaches</legend>
          {choices.map(i=><label key={i} className="flex items-start gap-2 rounded-lg border border-slate-500/40 p-3">
            <input type="radio" checked={selected===i} name={"sim-adaptive-"+simulator} onChange={()=>setSelected(i)}/>
            <span>{item.options[i]}</span>
          </label>)}
          {selected!==null?<button type="button" onClick={()=>setSelected(null)} className="text-sm underline underline-offset-2">Clear comparison selection</button>:null}
        </fieldset>
        {gradingError?<p role="alert" className="rounded-lg border border-amber-500/60 p-3 text-sm">{gradingError}</p>:null}
        {!feedback?<button type="button" className={button} onClick={()=>void submit()} disabled={grading||!reason.trim()}>{grading?"Assessing your idea…":"Assess my reasoning"}</button>:null}
        {feedback?<div className="space-y-3 rounded-xl border border-slate-500/40 p-4" role="status">
          <p className="font-semibold">{feedback.finished?feedback.independent?"Independent reasoning demonstrated.":"Good progress with coaching.":needsClarification?"Promising thinking. One detail to explore.":"This plan needs revisiting."}</p>
          <p>{feedback.data.summary}</p>
          {feedback.data.creativeAlternative?<p className="text-sm font-medium">Your alternative approach was considered rather than automatically rejected for differing from the examples.</p>:null}
          <p className="text-sm"><strong>Next step:</strong> {feedback.data.improvement}</p>
          {feedback.data.dimensions?<p className="text-xs">Rubric (out of 4): understanding {feedback.data.dimensions.understanding}, evidence {feedback.data.dimensions.evidence}, alternatives {feedback.data.dimensions.alternatives}, practical judgement {feedback.data.dimensions.risk}.</p>:null}
          {needsClarification?<div className="space-y-2 rounded-lg border border-emerald-600/50 p-3">
            <label className="block font-semibold" htmlFor={"followup-"+simulator}>{feedback.data.followUpQuestion??"What condition would you need to verify before acting?"}</label>
            <textarea id={"followup-"+simulator} className="w-full rounded-lg border border-slate-400 bg-transparent p-3" rows={3} maxLength={1000}
              placeholder="A short clarification is enough…" disabled={grading} value={clarification} onChange={e=>setClarification(e.target.value)}/>
            <button type="button" className={button} disabled={grading||!clarification.trim()} onClick={()=>void submit(true)}>{grading?"Reviewing your clarification…":"Send clarification"}</button>
          </div>:null}
          {needsRevision?<div className="flex flex-wrap gap-2">
            <button type="button" className={button} onClick={()=>{setFeedback(null);setUsedHelp(true);}}>Improve my answer</button>
            <button type="button" className="rounded-lg border border-current px-4 py-2" onClick={skip}>Move on for now</button>
          </div>:null}
          {feedback.finished?<div className="space-y-3">
            <p className="text-sm">Reference approach: {item.options[item.answer]} {item.explanation}</p>
            <p className="text-sm">{feedback.independent?"This counts towards independent mastery.":"The improved answer counts as coached practice, not an independent first-attempt success."} Next tier: <strong>{levelLabel(feedback.nextLevel as 1|2|3)}</strong>.</p>
            <button type="button" className="rounded-lg border border-current px-5 py-3" onClick={next}>Next challenge →</button>
          </div>:null}
        </div>:null}
      </div>
    }
    <p className="text-xs">Only your submitted writing goes to Groq, so don't include identifiable volunteer or customer information. Your draft isn't saved locally. AI feedback is educational and does not certify practical competence.</p>
  </section>;
}
