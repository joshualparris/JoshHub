"use client";
import { useEffect, useState } from "react";
import {ArrowLeft,ArrowRight,Check,CheckCircle2,Download,ExternalLink,MapPin,RotateCcw,ShieldCheck,Users,Volume2,VolumeX} from "lucide-react";
import course from "@/data/repair-cafe-simulator.json";
import AdaptiveSimQuiz from "@/components/learn/AdaptiveSimQuiz";
import {INITIAL_SIM_STATE,REPAIR_CAFE_STORAGE_KEY,activeRoles,canConfirmVolunteer,canPlaceVolunteer,canDebrief,dayMetrics,readinessBlockers,restoreSim,eventDecision,recoverDecision,canAdvanceEvent,nextEvent,eventPressure,type SimState} from "@/lib/learning/repair-cafe-logic";

const stages=["venue","roster","safety","event","debrief"] as const;
type Stage=typeof stages[number];
const names:Record<Stage,string>={venue:"1 · Venue",roster:"2 · Crew",safety:"3 · Safety",event:"4 · Event day",debrief:"5 · Debrief"};
const box="rounded-2xl border border-emerald-900/15 bg-white p-4 shadow-sm sm:p-6";
const btn="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-800 disabled:opacity-40";
const go="rounded-xl bg-emerald-900 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-40";
const title="text-2xl font-black tracking-tight text-stone-900";

export default function RepairCafeSimulator(){
  const [state,setState]=useState<SimState>(INITIAL_SIM_STATE);
  const [stage,setStage]=useState<Stage>("venue");
  const [hydrated,setHydrated]=useState(false);
  const [saveError,setSaveError]=useState(false);
  const [debriefLoading,setDebriefLoading]=useState(false);
  const [debriefFeedback,setDebriefFeedback]=useState<{passed:boolean;status:"pass"|"clarify"|"revise";summary:string;improvement:string;followUpQuestion?:string|null}|null>(null);
  const [debriefFollowUp,setDebriefFollowUp]=useState("");
  const [debriefAnswers,setDebriefAnswers]=useState("");
  const [debriefError,setDebriefError]=useState("");
  const [decisionReason,setDecisionReason]=useState("");
  const [speaking,setSpeaking]=useState(false);
  const [media,setMedia]=useState<"sources"|"video"|"audio">("sources");
  const [imageError,setImageError]=useState(false);
  useEffect(()=>{try{const raw=window.localStorage.getItem(REPAIR_CAFE_STORAGE_KEY);if(raw){const s=restoreSim(JSON.parse(raw));s.incidentIndex=Math.min(s.incidentIndex,course.incidents.length);setState(s);}}catch{setSaveError(true);}setHydrated(true);},[]);
  useEffect(()=>{if(!hydrated)return;try{window.localStorage.setItem(REPAIR_CAFE_STORAGE_KEY,JSON.stringify(state));setSaveError(false);}catch{setSaveError(true);}},[state,hydrated]);
  useEffect(()=>()=>{if(typeof window!=="undefined" && "speechSynthesis" in window)window.speechSynthesis.cancel();},[]);
  const venue=course.venues.find(v=>v.id===state.venueId);
  const blockers=readinessBlockers(state,course);
  const ready=blockers.length===0;
  const locked=state.incidentIndex>0;
  const closed=state.incidentIndex>=course.incidents.length;
  const incident=course.incidents[state.incidentIndex];
  const currentDecision=incident?state.decisions.find(x=>x.incidentId===incident.id):undefined;
  const chosenOption=incident?.choices.find(x=>x.id===currentDecision?.choiceId);
  const metrics=dayMetrics(state,course);
  const finished=canDebrief(state,course);
  const guide=course.reading.find(x=>x.step===stage)!;
  const roleReady=activeRoles(state).every(role=>!!state.assigned[role]&&canPlaceVolunteer(course,state,role,state.assigned[role]));
  const checklistReady=course.checks.every(c=>state.checks.includes(c.id))&&course.questions.every(q=>state.quizAnswers[q.id]===q.answer);
  const percent=Math.round((Number(!!venue && state.venueConfirmed)+Number(roleReady)+Number(checklistReady)+state.incidentIndex/course.incidents.length+Number(finished))*20);

  function toggleScope(id:string){if(locked)return;setState(s=>({...s,activeStations:s.activeStations.includes(id)?s.activeStations.filter(x=>x!==id):[...s.activeStations,id]}));}
  function assign(role:string,id:string){if(locked)return;if(id && !canPlaceVolunteer(course,state,role,id))return;setState(s=>({...s,assigned:id?{...s.assigned,[role]:id}:Object.fromEntries(Object.entries(s.assigned).filter(([key])=>key!==role))}));}
  function scenarioDecision(id:string) {
    if(!incident || currentDecision)return;
    setState(prev=>eventDecision(prev,course,incident.id,id,decisionReason));
  }
  function advance(){
    if(!canAdvanceEvent(state,course))return;
    setState(prev=>nextEvent(prev,course));
    setDecisionReason("");
  }
  function recover(){
    setState(prev=>recoverDecision(prev,course));
  }
  function narration(){if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();if(speaking){setSpeaking(false);return;}const u=new SpeechSynthesisUtterance(guide.heading+". "+guide.body+" "+guide.prompt);u.lang="en-AU";u.rate=0.92;u.onend=()=>setSpeaking(false);u.onerror=()=>setSpeaking(false);setSpeaking(true);window.speechSynthesis.speak(u);}
  async function gradeDebrief(){
    if(debriefLoading || !closed || !state.reflection.trim())return;
    const followUpNeeded=debriefFeedback?.status==="clarify"&&!debriefFeedback.passed;
    if(followUpNeeded&&!debriefFollowUp.trim())return;
    const answers=followUpNeeded?[debriefAnswers,"Further answer: "+debriefFollowUp.trim()].filter(Boolean).join("\n") : debriefAnswers;
    setDebriefLoading(true);setDebriefError("");setDebriefFeedback(null);
    try{
      const res=await fetch("/api/learning/grade",{
        method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
        body:JSON.stringify({kind:"reflection",course:"cafe",response:[state.reflection.trim(),"Accountable role: "+state.improvementOwner,"Check whether it worked: "+state.improvementMeasure,answers].filter(Boolean).join("\n")})
      });
      const result=await res.json() as {passed?:boolean;status?:"pass"|"clarify"|"revise";summary?:string;improvement?:string;followUpQuestion?:string|null;error?:string};
      if(!res.ok){setDebriefError(result.error??result.summary??"The reflection was not graded. Try again.");return;}
      const passed=result.passed===true&&result.status==="pass";
      if(followUpNeeded){setDebriefAnswers(answers);setDebriefFollowUp("");}
      setDebriefFeedback({passed,status:result.status??"revise",summary:result.summary??"Reasoning reviewed.",improvement:result.improvement??"Add concrete event evidence and consider alternatives.",followUpQuestion:result.followUpQuestion});
      setState(prev=>({...prev,debriefPassed:passed}));
    }catch{setDebriefError("The grader could not be reached. No completion has been awarded.");}
    finally{setDebriefLoading(false);}
  }
  function exportReport(){
    if(!finished)return;
    const report={
      course:course.title,version:course.version,fictional:true,
      venue:venue?.title,stations:state.activeStations,
      confirmedRoles:activeRoles(state).map(role=>({role,assigned:Boolean(state.assigned[role])})),
      decisions:state.decisions.map(x=>{
        const incident=course.incidents.find(e=>e.id===x.incidentId);
        return {incident:x.incidentId,time:incident?.at,choice:incident?.choices.find(c=>c.id===x.choiceId)?.label??"unknown",firstChoiceSafe:x.safe,recoveryCompleted:x.recovered,reason:x.reason};
      }),
      metrics:dayMetrics(state,course),
      initialRiskDecisions:state.badChoices,
      reflection:state.reflection,improvementOwner:state.improvementOwner,improvementMeasure:state.improvementMeasure,
      simulationFinished:finished,verification:"Self-reported, browser-local learning only; not observed real-world competence."
    };
    const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="repair-cafe-learning-evidence.json";a.click();URL.revokeObjectURL(url);
  }
  return <article className="overflow-hidden rounded-3xl bg-[#f6f1e4] text-stone-900">
    <header className="bg-gradient-to-br from-emerald-950 via-[#1b5143] to-[#4c7552] px-5 py-8 text-white sm:px-9">
      <a href="/learn" className="inline-flex items-center gap-2 text-sm text-emerald-100 hover:underline"><ArrowLeft size={16}/> Back to JoshHub Learn</a>
      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-amber-200">JoshHub Learning Lab · Community leadership simulation</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight sm:text-6xl">Run Your Own <span className="text-amber-200">Repair Café</span></h1>
      <p className="mt-4 max-w-2xl leading-7 text-emerald-50">You have one Saturday, seven volunteers and a community ready to fix things together. Plan the venue, build the roster, welcome visitors and handle surprises safely.</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white/15 px-3 py-2">5 distinct stages</span><span className="rounded-full bg-white/15 px-3 py-2">7 event situations</span><span className="rounded-full bg-white/15 px-3 py-2">Entirely fictional · no real data</span></div>
      <div className="mt-6 max-w-lg"><div className="mb-1 flex justify-between text-xs text-emerald-100"><span>Simulation progress</span><span>{percent}%</span></div><progress aria-label="Course progress" value={percent} max={100} className="h-3 w-full accent-amber-300"/><p className="mt-1 text-xs text-emerald-100">{saveError?"Browser progress cannot be saved.":"Progress saves in this browser only."}</p></div>
    </header>
    <div className="space-y-6 p-4 sm:p-7">
      <AdaptiveSimQuiz simulator="cafe" />
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Learning stages">{stages.map(s=><button type="button" key={s} onClick={()=>setStage(s)} aria-current={s===stage?"step":undefined} className={"min-h-16 rounded-xl border p-3 text-left text-sm font-bold "+(stage===s?"border-emerald-900 bg-emerald-900 text-white":"border-stone-300 bg-white hover:bg-emerald-50")}>{names[s]}</button>)}</nav>
      <aside className="rounded-xl border border-emerald-800/30 bg-[#e0efdf] p-4 text-sm">
        <strong className="text-emerald-950">Coordinator mastery playbook</strong>
        <p className="mt-1 text-stone-800">Four worked cases, a real-world observation checklist, media reflections and a 16-point evidence rubric. Use it to prepare, then compare it with your own decision ledger.</p>
        <a className="mt-2 inline-flex items-center gap-1 font-bold text-emerald-900 underline underline-offset-2" href="https://github.com/joshualparris/JoshHub/blob/main/docs/learning-lab/REPAIR-CAFE-COORDINATOR-MASTERY-PLAYBOOK.md" target="_blank" rel="noopener noreferrer">Read the playbook <ExternalLink size={14}/></a>
      </aside>
      <section className={box}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Coordinator field guide · {names[stage]}</p><h2 className={"mt-2 "+title}>{guide.heading}</h2></div><button className={btn} type="button" onClick={narration}>{speaking?<VolumeX size={15} className="mr-2 inline"/>:<Volume2 size={15} className="mr-2 inline"/>}{speaking?"Stop reading":"Listen to this lesson"}</button></div><p className="mt-3 max-w-4xl leading-7 text-stone-700">{guide.body}</p><p className="mt-4 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3 text-sm font-semibold">{guide.prompt}</p></section>

      {stage==="venue" && <section className={box}>
        <h2 className={title}><MapPin size={23} className="mr-2 inline text-emerald-800"/>Choose your venue</h2><p className="mt-2 text-sm">All venue names, fees and approvals are invented for this training exercise.</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">{course.venues.map(v=><button type="button" key={v.id} disabled={locked} aria-pressed={v.id===venue?.id} onClick={()=>setState(s=>({...s,venueId:v.id,venueConfirmed:false}))} className={"rounded-xl border-2 p-4 text-left "+(v.id===venue?.id?"border-emerald-700 bg-emerald-50":"border-stone-200 hover:border-emerald-500")}>
          <p className="text-xs text-stone-600">{v.type}</p><h3 className="mt-2 text-lg font-bold">{v.title}</h3><p className="mt-2 text-sm font-bold text-emerald-900">{"$"}{v.fee} fictional hire · {v.capacity} capacity</p><p className="mt-3 text-sm">{v.strength}</p><p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs">{v.limit}</p><p className="mt-3 text-xs">{v.accessible?"Step-free route":"Access barrier — not ready"}</p>{v.id===venue?.id?<p className="mt-2 text-sm font-bold text-emerald-800"><Check size={14} className="mr-1 inline"/>Selected</p>:null}
        </button>)}</div>
        <h3 className="mt-6 text-lg font-bold">Which stations will run?</h3><p className="text-sm">Only open categories compatible with the venue and available volunteer skills. Mains-electrical repairs are excluded.</p>
        <div className="mt-3 flex flex-wrap gap-2">{course.roles.filter(r=>["sewing","computers","bikes"].includes(r.id)).map(r=><label key={r.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-300 p-3 text-sm"><input className="accent-emerald-800" type="checkbox" disabled={locked} checked={state.activeStations.includes(r.id)} onChange={()=>toggleScope(r.id)}/>{r.label}</label>)}</div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-xl border border-emerald-700/30 bg-[#dcead7] p-4"><p className="text-xs font-black uppercase tracking-wider text-emerald-900">Interactive venue floor plan</p><div className="mt-3 grid min-h-60 grid-cols-2 gap-2 rounded-xl border-4 border-emerald-900/20 bg-[#fcf9e9] p-3 sm:grid-cols-3">
            <div className="flex items-center justify-center rounded-lg border-2 border-emerald-600 bg-emerald-50 p-3 text-center text-xs font-bold">👋 Welcome & check-in</div>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-stone-400 bg-white p-3 text-center text-xs font-bold">☕ Waiting & learning</div>
            <div className="flex items-center justify-center rounded-lg border-2 border-sky-600 bg-sky-50 p-3 text-center text-xs font-bold">🧰 Safety & first aid</div>
            {course.roles.filter(r=>state.activeStations.includes(r.id)).map(r=><div key={r.id} className="flex items-center justify-center rounded-lg border-2 border-amber-600 bg-amber-50 p-3 text-center text-xs font-bold">{r.label}</div>)}
            <div className="flex items-center justify-center rounded-lg border border-dashed border-emerald-800 bg-white p-3 text-center text-xs font-bold">Accessible exit ↗</div>
          </div><p className="mt-2 text-xs">Concept layout only, not a real evacuation diagram or accessibility assessment.</p></div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><h3 className="font-bold">Written booking check</h3><p className="mt-2 text-sm">{venue?.approval??"Choose a venue to see its fictional permission status."}</p><label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 bg-white p-3 text-sm"><input type="checkbox" className="mt-1 accent-emerald-800" disabled={locked||!venue} checked={state.venueConfirmed} onChange={e=>setState(s=>({...s,venueConfirmed:e.target.checked}))}/><span>I've reviewed the <strong>fictional written confirmation</strong> for this date and permitted activities. This does not book a real venue.</span></label>{venue && state.activeStations.some(s=>!venue.allowed.includes(s))?<p role="alert" className="mt-3 rounded-lg bg-rose-100 p-3 text-sm">This venue prohibits at least one selected station. Adjust the scope.</p>:null}</div>
        </div>
        <button type="button" className={go+" mt-5"} onClick={()=>setStage("roster")}>Build the volunteer team <ArrowRight size={15} className="ml-2 inline"/></button>
      </section>}

      {stage==="roster" && <section className={box}>
        <h2 className={title}><Users size={23} className="mr-2 inline text-emerald-800"/>Build your volunteer team</h2><p className="mt-2 text-sm">Skill, availability and accepted shifts are different things. These are fictional volunteers.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{course.volunteers.map(v=>{const accepted=v.response==="accepted"||state.extraAccepted.includes(v.id);return <div key={v.id} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{v.name}</h3><span className={"rounded-full px-2 py-1 text-xs font-semibold "+(accepted?"bg-emerald-100 text-emerald-900":v.response==="declined"?"bg-rose-100":"bg-amber-100")}>{accepted?"Accepted":v.response==="declined"?"Unavailable":"Available only"}</span></div>
          <p className="mt-2 text-xs">Skills: {v.skills.map(k=>course.roles.find(r=>r.id===k)?.label).join(", ")}</p><p className="mt-2 text-sm">{v.note}</p>
          {v.response==="available"&&!state.extraAccepted.includes(v.id)?<button className={btn+" mt-3"} disabled={locked} type="button" onClick={()=>{if(canConfirmVolunteer(course,v.id))setState(s=>({...s,extraAccepted:[...new Set([...s.extraAccepted,v.id])]}));}}>Receive fictional shift acceptance</button>:null}
        </div>;})}</div>
        <h3 className="mt-6 text-xl font-bold">Your roster</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{activeRoles(state).map(role=>{const r=course.roles.find(x=>x.id===role);const eligible=course.volunteers.filter(v=>canPlaceVolunteer(course,state,role,v.id)||state.assigned[role]===v.id);return <div key={role} className="rounded-xl border border-stone-200 p-4"><label htmlFor={"role-"+role} className="block font-bold">{r?.label}</label><p className="my-2 text-xs">{r?.description}</p><select id={"role-"+role} disabled={locked} value={state.assigned[role]??""} onChange={e=>assign(role,e.target.value)} className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm"><option value="">Unfilled position</option>{eligible.map(v=><option value={v.id} key={v.id}>{v.name}</option>)}</select></div>;})}</div>
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">{activeRoles(state).filter(r=>state.assigned[r]&&canPlaceVolunteer(course,state,r,state.assigned[r])).length} / {activeRoles(state).length} shift roles accepted and assigned.</p>
        <button type="button" className={go+" mt-5"} onClick={()=>setStage("safety")}>Go to the launch gates <ArrowRight size={15} className="ml-2 inline"/></button>
      </section>}

      {stage==="safety" && <section className={box}>
        <h2 className={title}><ShieldCheck size={23} className="mr-2 inline text-emerald-800"/>Ready to open?</h2><p className="mt-2 text-sm">Tick only the simulated planning evidence. None of this amounts to actual insurance approval or safety sign-off.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{course.checks.map(c=><label key={c.id} className={"flex cursor-pointer items-start gap-3 rounded-xl border p-4 "+(state.checks.includes(c.id)?"border-emerald-700 bg-emerald-50":"border-stone-200")}>
          <input className="mt-1 accent-emerald-800" type="checkbox" checked={state.checks.includes(c.id)} disabled={locked} onChange={()=>setState(s=>({...s,checks:s.checks.includes(c.id)?s.checks.filter(x=>x!==c.id):[...s.checks,c.id]}))}/><span><strong className="text-sm">{c.label}</strong><span className="mt-2 block text-xs leading-5">{c.why}</span></span>
        </label>)}</div>
        <h3 className="mt-6 text-xl font-bold">Check your coordinator judgement</h3><div className="mt-3 space-y-4">{course.questions.map((q,i)=><fieldset key={q.id} className="rounded-xl border border-stone-200 p-4"><legend className="px-1 text-sm font-bold">Question {i+1} / 3</legend><p className="mt-2 font-semibold">{q.question}</p><div className="mt-3 space-y-2">{q.options.map((o,j)=><label key={o} className={"flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm "+(state.quizAnswers[q.id]===j?"border-emerald-700 bg-emerald-50":"border-stone-200")}><input type="radio" name={q.id} className="mt-1 accent-emerald-800" disabled={locked} checked={state.quizAnswers[q.id]===j} onChange={()=>setState(s=>({...s,quizAnswers:{...s.quizAnswers,[q.id]:j}}))}/><span>{o}</span></label>)}</div>{state.quizAnswers[q.id]!==undefined?<p role="status" className="mt-3 text-sm">{state.quizAnswers[q.id]===q.answer?"Correct. ":"Try again. "}{q.why}</p>:null}</fieldset>)}</div>
        <div className={"mt-5 rounded-xl border p-4 "+(ready?"border-emerald-700 bg-emerald-50":"border-amber-400 bg-amber-50")}><h3 className="font-bold">{ready?"Simulation ready to open":"Outstanding preparation gates"}</h3>{!ready?<ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{blockers.map((b,i)=><li key={i}>{b}</li>)}</ul>:<p className="mt-2 text-sm">You've satisfied the fictional planning conditions. This is not approval for a real event.</p>}</div><button type="button" className={go+" mt-5"} disabled={!ready} onClick={()=>setStage("event")}>Open the doors <ArrowRight size={15} className="ml-1 inline"/></button>
      </section>}

      {stage==="event" && <section className={box}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className={title}>Your Saturday event desk</h2><span className="rounded-full bg-amber-100 px-3 py-2 text-sm font-bold">{closed?"13:00 · Closed":incident.at+" · Saturday"}</span></div>
        {!ready?<div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm">You cannot open until the venue, crew and safety preparation are ready. <button type="button" className="font-bold underline" onClick={()=>setStage("safety")}>Resolve launch gates.</button></div>:<>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Community trust",metrics.trust],["Volunteer energy",metrics.energy],["Queue pressure",metrics.queue]].map(([k,v])=><div key={k} className="rounded-xl border border-stone-200 bg-emerald-50 p-4"><p className="text-xs">{k}</p><p className="mt-1 text-3xl font-black">{v}</p></div>)}</div>
          <div className="mt-4 h-2 rounded-full bg-stone-200"><div className="h-full rounded-full bg-emerald-800" style={{width:(state.incidentIndex/course.incidents.length*100)+"%"}}/></div><p className="mt-2 text-xs">{state.incidentIndex} / {course.incidents.length} events closed. First choices persist; a risky choice creates an incident to recover from and affects the remaining event.</p>
          <p className="mt-4 rounded-xl border-l-4 border-amber-600 bg-amber-50 p-3 text-sm" role="status"><strong>Situation update:</strong> {eventPressure(state,course)}</p>
          {closed?<div className="mt-5 rounded-2xl bg-emerald-900 p-6 text-white"><CheckCircle2 size={32} className="text-amber-200"/><h3 className="mt-3 text-2xl font-black">The fictional doors are closed.</h3><p className="mt-2 text-sm">You have an accountable record of all seven first decisions, including {state.badChoices} choices that required safety recovery. Review the consequences in your event portfolio before making the next-month improvement plan.</p><button type="button" className="mt-4 rounded-xl bg-amber-200 px-4 py-3 font-bold text-emerald-950" onClick={()=>setStage("debrief")}>Debrief the event →</button></div>:
            <div className="mt-5 rounded-2xl border-2 border-emerald-700 bg-[#fff9e8] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-900">{incident.type} · Situation {state.incidentIndex+1}/{course.incidents.length}</p>
              <h3 className="mt-2 text-2xl font-black">{incident.title}</h3>
              <p className="mt-3 leading-7">{incident.story}</p>
              {!currentDecision?<div>
                <label htmlFor="decision-reason" className="mt-5 block text-sm font-bold">Field notebook: what evidence matters, and what is uncertain?</label>
                <textarea id="decision-reason" rows={3} maxLength={500} value={decisionReason} onChange={e=>setDecisionReason(e.target.value)} placeholder="Record your reasoning before choosing. The final AI debrief, not this draft, is assessed." className="mt-2 w-full rounded-xl border border-stone-300 bg-white p-3 text-sm"/>
                <p className="mt-2 text-xs">Your first choice is final for this simulated incident. Mistakes stay in the log and change the workload. This field note is not separately graded.</p>
                <div className="mt-4 grid gap-3">{incident.choices.map(c=><button key={c.id} type="button" onClick={()=>scenarioDecision(c.id)} className="rounded-xl border-2 border-stone-200 bg-white p-4 text-left text-sm hover:border-emerald-600 focus-visible:outline-2 focus-visible:outline-emerald-800">{c.label}</button>)}</div>
              </div>:<div role="status" className="mt-5 rounded-xl border border-stone-300 bg-white p-4">
                <p className={"font-bold "+(currentDecision.safe?"text-emerald-900":"text-rose-900")}>{currentDecision.safe?"Strong first judgement.":"Your first judgement caused a simulated incident."}</p>
                <p className="mt-2 text-sm"><strong>Chosen approach:</strong> {chosenOption?.label}</p>
                <p className="mt-2 text-sm"><strong>Consequence:</strong> {chosenOption?.why}</p>
                <p className="mt-3 text-xs text-stone-700">The resulting impact on community trust, team energy and queue pressure is already reflected above. It will not be erased by correction.</p>
                {!currentDecision.safe && !currentDecision.recovered?<div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm">
                  <h4 className="font-bold text-rose-900">Incident recovery required</h4>
                  <p className="mt-2"><strong>Immediate response:</strong> {incident.recovery.immediate}</p>
                  <p className="mt-2"><strong>Safeguard:</strong> {incident.recovery.safeguard}</p>
                  <p className="mt-2"><strong>What to record:</strong> {incident.recovery.evidence}</p>
                  <p className="mt-2">Recovery consumes time and capacity in this fictional event; it does not erase the first decision.</p>
                  <button type="button" className={btn+" mt-3"} onClick={recover}>Record recovery actions and accept the consequences</button>
                </div>:<button type="button" className={go+" mt-4"} onClick={advance}>Advance the clock <ArrowRight size={14} className="ml-1 inline"/></button>}
              </div>}
            </div>}

        </>}
      </section>}

      {stage==="debrief" && <section className={box}>
        <h2 className={title}>Reflect and prepare for next month</h2>
        {!closed?<p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm">Complete the seven simulated event situations first. <button type="button" className="font-bold underline" onClick={()=>setStage("event")}>Return to event desk.</button></p>:<>
          <div className="mt-5 grid grid-cols-3 gap-2">{[["Safe decisions",state.incidentIndex],["Retried choices",state.badChoices],["Open stations",state.activeStations.length]].map(([k,v])=><div key={k} className="rounded-lg bg-emerald-50 p-3 text-center"><p className="text-xs">{k}</p><p className="mt-2 text-2xl font-black">{v}</p></div>)}</div>
          <p className="mt-4 text-sm">This portfolio records your actual simulated choices, including first-choice errors and recovery. No real repairs, savings or volunteer hours are claimed.</p>
          <div className="mt-5 rounded-xl border border-stone-200 p-4"><h3 className="font-bold">Your simulated event decision ledger</h3><ol className="mt-3 space-y-3 text-sm">{state.decisions.map((d,i)=>{const e=course.incidents.find(x=>x.id===d.incidentId);return <li key={d.incidentId} className="border-l-2 border-stone-300 pl-3"><strong>{i+1}. {e?.title}</strong> · {d.safe?"Sound first judgement":"Risky first judgement; recovered"}<p className="mt-1 text-stone-600">{e?.choices.find(c=>c.id===d.choiceId)?.label}</p>{d.reason?<p className="mt-1 italic text-stone-700">Your note: {d.reason}</p>:null}</li>;})}</ol></div>
          <label className="mt-4 block font-bold" htmlFor="reflection-owner">Who would own your proposed improvement?</label>
          <input id="reflection-owner" className="mt-2 w-full rounded-xl border border-stone-300 p-3" maxLength={100} placeholder="e.g. Event coordinator, with a backup volunteer" value={state.improvementOwner} onChange={e=>{setDebriefFeedback(null);setDebriefAnswers("");setDebriefFollowUp("");setState(x=>({...x,improvementOwner:e.target.value,debriefPassed:false}));}}/>
          <label className="mt-4 block font-bold" htmlFor="reflection-measure">How would you check if the improvement worked?</label>
          <textarea id="reflection-measure" rows={2} maxLength={300} className="mt-2 w-full rounded-xl border border-stone-300 p-3" placeholder="e.g. Compare recorded wait estimates and number of abandoned queues over two sessions." value={state.improvementMeasure} onChange={e=>{setDebriefFeedback(null);setDebriefAnswers("");setDebriefFollowUp("");setState(x=>({...x,improvementMeasure:e.target.value,debriefPassed:false}));}}/>
          <label className="mt-4 block font-bold" htmlFor="reflection-cafe">What one thing would you improve next time?</label>
          <textarea id="reflection-cafe" rows={5} className="mt-3 w-full rounded-xl border border-stone-300 p-4" maxLength={1500} placeholder="Next month I would…" value={state.reflection} onChange={e=>{setDebriefFeedback(null);setDebriefAnswers("");setDebriefFollowUp("");setDebriefError("");setState(s=>({...s,reflection:e.target.value,debriefPassed:false}));}}/>
          <p className="mt-3 text-sm text-stone-700">Give a concrete incident, one feasible change, why it is preferable to another reasonable approach, and how you will assess the result. Your writing is sent to Groq only when you submit; do not include personal details.</p>
          <button type="button" className={go+" mt-3"} disabled={debriefLoading||Boolean(debriefFeedback?.passed)||Boolean(debriefFeedback?.status==="clarify")||!state.reflection.trim()||!state.improvementOwner.trim()||!state.improvementMeasure.trim()} onClick={()=>void gradeDebrief()}>{debriefLoading?"Assessing event reflection…":"Have Groq assess my plan"}</button>
          {debriefError?<p role="alert" className="mt-3 rounded-lg border border-amber-600 p-3 text-sm">{debriefError}</p>:null}
          {debriefFeedback?<div role="status" className="mt-3 rounded-lg border border-stone-300 p-3 text-sm"><p className="font-bold">{debriefFeedback.passed?"Reflection demonstrates applied planning.":debriefFeedback.status==="clarify"?"Promising plan: one detail to confirm.":"Let's improve this plan."}</p><p className="mt-1">{debriefFeedback.summary}</p><p className="mt-2"><strong>Next step:</strong> {debriefFeedback.improvement}</p>
            {debriefFeedback.status==="clarify"&&!debriefFeedback.passed?<div className="mt-3 space-y-2">
              <label htmlFor="debrief-clarification" className="block font-semibold">{debriefFeedback.followUpQuestion??"What evidence or authorisation would make your plan safe and workable?"}</label>
              <textarea id="debrief-clarification" rows={3} maxLength={850} className="w-full rounded-lg border border-stone-300 p-3" placeholder="A short clarification is fine…" value={debriefFollowUp} onChange={e=>setDebriefFollowUp(e.target.value)}/>
              <button type="button" className={go} disabled={debriefLoading||!debriefFollowUp.trim()} onClick={()=>void gradeDebrief()}>{debriefLoading?"Reviewing…":"Send clarification"}</button>
            </div>:null}
          </div>:null}
          {finished?<div className="mt-4 rounded-xl bg-emerald-900 p-5 text-white"><CheckCircle2 className="text-amber-200"/><h3 className="mt-2 text-2xl font-black">Simulation completed</h3><p className="mt-2 text-sm">You've recorded your real first decisions in this fictional exercise, recovered from incidents where needed, and produced an AI-reviewed improvement plan. Real event leadership still needs supervised observation.</p></div>:<p className="mt-2 text-sm">Completion requires a substantive event-improvement plan that passes the AI grading rubric, not a character count.</p>}
          <button type="button" className={go+" mt-4"} disabled={!finished} onClick={exportReport}><Download size={16} className="mr-1 inline"/> Export fictional event report</button>
        </>}
      </section>}

      <section className={box}><h2 className={title}>Learn from real Repair Cafés</h2><p className="mt-2 text-sm">Optional source-linked video, photo, audio and reading. The simulated case decisions remain the primary learning.</p><div role="tablist" aria-label="Learning media" className="mt-4 flex flex-wrap gap-2">{(["sources","video","audio"] as const).map(tab=><button key={tab} type="button" role="tab" aria-selected={media===tab} className={btn+(media===tab?" border-emerald-800 bg-emerald-50":"")} onClick={()=>setMedia(tab)}>{tab==="sources"?"Evidence library":tab==="video"?"Photos and film":"Podcasts and listening"}</button>)}</div>
        {media==="sources"?<div className="mt-4 grid gap-2 sm:grid-cols-2">{course.sources.map(source=><a className="rounded-lg border border-stone-200 p-3 text-sm hover:border-emerald-700" key={source.url} href={source.url} target="_blank" rel="noreferrer"><span className="block text-xs font-bold uppercase text-emerald-800">{source.kind}</span><span className="mt-1 block font-semibold">{source.title} <ExternalLink size={14} className="inline"/></span></a>)}</div>:null}
        {media==="video"?<div className="mt-5 grid gap-4 lg:grid-cols-2"><figure className="overflow-hidden rounded-xl border border-stone-200">{!imageError?<img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Repair_Caf%C3%A9_Trier_Reparatur.jpg/960px-Repair_Caf%C3%A9_Trier_Reparatur.jpg" onError={()=>setImageError(true)} alt="Volunteers working together to repair an appliance at a real Repair Café" className="aspect-[3/2] w-full object-cover" loading="lazy"/>:<p className="p-4">Photo could not be loaded; see original link.</p>}<figcaption className="p-3 text-xs">Repair Café Trier, RaMa2016, CC BY-SA 4.0, unmodified. <a className="underline" href="https://commons.wikimedia.org/wiki/File:Repair_Caf%C3%A9_Trier_Reparatur.jpg" target="_blank" rel="noreferrer">Original photo and licence ↗</a></figcaption></figure>
          <div className="rounded-xl bg-emerald-50 p-5"><h3 className="text-lg font-bold">15 years of Repair Café</h3><p className="mt-2 text-sm leading-6">This official documentary explores the movement and learning through repair. The publisher notes optional English subtitles. Observe how visitors and volunteers collaborate.</p><a className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-sm font-bold text-white" href="https://www.repaircafe.org/en/anniversary-documentary-on-15-years-of-repair-cafe/" target="_blank" rel="noreferrer">Watch official film <ExternalLink size={14}/></a></div></div>:null}
        {media==="audio"?<div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-stone-200 p-4"><h3 className="font-bold">Stage briefings</h3><p className="mt-2 text-sm">Choose any course stage above and tap “Listen to this lesson”. Your browser reads its written transcript using local text-to-speech; this is not a recorded podcast.</p><button type="button" className={btn+" mt-3"} onClick={narration}><Volume2 size={15} className="mr-1 inline"/> Play current briefing</button></div><div className="rounded-xl border border-stone-200 p-4"><h3 className="font-bold">Restart Radio</h3><p className="mt-2 text-sm">Original conversations with community repairers and circular economy organisers. Reflection: what supports volunteers beyond counting repairs?</p><a href="https://therestartproject.org/podcast/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-800 underline">Browse real podcast episodes <ExternalLink size={14}/></a></div></div>:null}
      </section>
      <footer className="rounded-xl border border-stone-300 bg-[#ece5d3] p-4 text-sm"><p><strong>Reality boundary:</strong> Every event, person, booking and scenario is fictional. This module is separate from Repair Café Dubbo's operational database. It cannot publish events, assign real shifts, notify volunteers or authorise electrical work.</p><button type="button" className={btn+" mt-4"} onClick={()=>{if(window.confirm("Erase only this simulator's locally saved progress?")){setState(INITIAL_SIM_STATE);setDecisionReason("");setStage("venue");}}}><RotateCcw size={15} className="mr-1 inline"/> Reset simulation</button></footer>
    </div>
  </article>;
}
