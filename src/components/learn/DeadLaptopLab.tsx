"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ClipboardCheck, Compass, ExternalLink, Headphones, Lightbulb, RotateCcw, ShieldAlert, Volume2, VolumeX, Wrench } from "lucide-react";
import data from "@/data/dead-laptop-detective.json";
import DetectiveMiniGames from "@/components/learn/DetectiveMiniGames";
import { STORAGE_VERSION, canCompleteMission, gradeCase, progressPercentage } from "@/lib/learning/dead-laptop-logic";

type AnswerKind = "activity" | "check";
type AnswerRecord = Record<string, { activity?: number; check?: number }>;
type LabState = {
  completed: string[];
  answers: AnswerRecord;
  observed: Record<string, string[]>;
  evidence: Record<string, string[]>;
  solved: Record<string, boolean>;
};
const emptyState: LabState = { completed: [], answers: {}, observed: {}, evidence: {}, solved: {} };
const labels: Record<string, string> = { all:"All tools", inspect:"Inspect", meter:"Virtual meter", swap:"Compare", display:"Display", firmware:"Firmware" };

const card = "rounded-2xl border border-slate-700/90 bg-slate-900/85 p-4 sm:p-6";
const smallButton = "rounded-xl border border-slate-600 px-3 py-2 text-sm font-semibold transition hover:border-cyan-300 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40";

function safeRead(): LabState {
  try {
    const raw = localStorage.getItem(STORAGE_VERSION);
    if (!raw) return emptyState;
    const record: unknown = JSON.parse(raw);
    if (!record || typeof record !== "object") return emptyState;
    const saved = record as Partial<LabState>;
    return {
      completed: Array.isArray(saved.completed) ? saved.completed.filter((id): id is string => typeof id === "string") : [],
      answers: saved.answers && typeof saved.answers === "object" ? saved.answers : {},
      observed: saved.observed && typeof saved.observed === "object" ? saved.observed : {},
      evidence: saved.evidence && typeof saved.evidence === "object" ? saved.evidence : {},
      solved: saved.solved && typeof saved.solved === "object" ? saved.solved : {}
    };
  } catch {
    return emptyState;
  }
}

export default function DeadLaptopLab() {
  const [state, setState] = useState<LabState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [missionIndex, setMissionIndex] = useState(0);
  const [caseId, setCaseId] = useState(data.cases[0].id);
  const [tool, setTool] = useState("all");
  const [meterMode, setMeterMode] = useState("volts");
  const [partId, setPartId] = useState("input");
  const [latest, setLatest] = useState("");
  const [feedback, setFeedback] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [mediaTab, setMediaTab] = useState<"video"|"audio"|"photo">("video");

  useEffect(() => {
    setState(safeRead());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_VERSION, JSON.stringify(state)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [state, hydrated]);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const mission = data.missions[missionIndex];
  const currentCase = data.cases.find(c => c.id === caseId) ?? data.cases[0];
  const selectedPart = data.board.find(p => p.id === partId) ?? data.board[0];
  const observations = state.observed[currentCase.id] ?? [];
  const cited = state.evidence[currentCase.id] ?? [];
  const total = progressPercentage(state.completed, data.missions.map(m => m.id));
  const solvedCount = data.cases.filter(c => state.solved[c.id]).length;
  const canFinish = canCompleteMission(mission.id, state.answers, mission.activity.answer, mission.check.answer, state.solved, data.cases.map(c => c.id));
  const testOptions = data.tests.filter(t => tool === "all" || tool === t.tool);

  function updateAnswer(kind: AnswerKind, answer: number) {
    setState(prev => ({ ...prev, answers: { ...prev.answers, [mission.id]: { ...prev.answers[mission.id], [kind]: answer } } }));
  }

  function runTest(testId: string) {
    const test = data.tests.find(t => t.id === testId);
    if (!test) return;
    if (test.tool === "meter" && ((testId === "ohms" && meterMode !== "ohms") || (testId === "adapter" && meterMode !== "volts"))) {
      setLatest(testId === "ohms" ? "Set the simulated meter to Ω first. Never use resistance mode on a live circuit." : "Switch this simulated meter to DC voltage. Resistance mode is not an appropriate live adapter test.");
      return;
    }
    const output = (currentCase.readings as Record<string,string>)[testId] ?? "No fictional reading available.";
    setLatest(test.title + ": " + output);
    setFeedback("");
    setState(prev => ({
      ...prev,
      observed: { ...prev.observed, [currentCase.id]: [...new Set([...(prev.observed[currentCase.id] ?? []), testId])] }
    }));
  }

  function toggleEvidence(testId: string) {
    if (!observations.includes(testId)) return;
    setFeedback("");
    setState(prev => {
      const values = prev.evidence[currentCase.id] ?? [];
      return { ...prev, evidence: { ...prev.evidence, [currentCase.id]: values.includes(testId) ? values.filter(id => id !== testId) : [...values, testId] } };
    });
  }

  const [verdict, setVerdict] = useState<Record<string, string>>({});
  function submitVerdict() {
    const result = gradeCase(currentCase, observations, cited, verdict[currentCase.id] ?? "");
    setFeedback(result.message + (result.passed ? " " + currentCase.reason : ""));
    if (result.passed) setState(prev => ({ ...prev, solved: { ...prev.solved, [currentCase.id]: true } }));
  }

  function changeCase(id: string) {
    setCaseId(id); setLatest(""); setFeedback("");
  }

  function completeMission() {
    if (!canFinish) return;
    setState(prev => ({ ...prev, completed: [...new Set([...prev.completed, mission.id])] }));
    if (missionIndex < data.missions.length - 1) setMissionIndex(i => i + 1);
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { setLatest("Narration is unavailable in this browser. All spoken text is available on screen."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-AU";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return <div className="overflow-hidden rounded-3xl bg-[#071525] text-slate-100 shadow-2xl">
    <div className="relative overflow-hidden border-b border-cyan-500/20 bg-gradient-to-br from-[#112b43] via-[#0b1b30] to-[#09251f] px-4 py-8 sm:px-8">
      <div className="pointer-events-none absolute right-[-40px] top-[-65px] h-64 w-64 rounded-full border border-cyan-300/20 bg-cyan-400/10 blur-3xl" />
      <a href="/learn" className="inline-flex items-center gap-2 text-sm text-cyan-200 underline-offset-4 hover:underline"><ArrowLeft size={16}/> Back to learning</a>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">JoshHub / Interactive learning laboratory / 2026</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">The Dead Laptop <span className="text-cyan-300">Detective</span></h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">You have a malfunctioning laptop and a workbench full of clues. Learn to diagnose the <strong>most likely fault family</strong>, not guess what to replace. Eight missions, three case files and one rule: evidence before verdict.</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-emerald-100"><ShieldAlert size={14} className="mr-1 inline"/> Fully simulated · no electrical risk</span>
        <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-sky-100">8 missions · about 80 minutes</span>
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-amber-100">3 final diagnostic cases</span>
      </div>
      <div className="mt-7 max-w-xl">
        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-300"><span>{state.completed.length}/8 missions completed</span><span>{total}%</span></div>
        <progress value={total} max={100} className="h-3 w-full accent-emerald-400" aria-label="Mission mastery progress" />
        <p className="mt-1 text-xs text-slate-400">Progress saves to this browser only, not your account or other devices. {storageError ? "Browser storage is blocked: progress may not persist." : hydrated ? "Autosave is active when storage is available." : "Loading progress…"}</p>
      </div>
    </div>

    <div className="space-y-7 p-4 sm:p-7">
      <section className={card} aria-labelledby="missions-title">
        <div className="mb-4 flex items-center gap-2"><Compass size={20} className="text-cyan-300"/><h2 id="missions-title" className="text-xl font-bold">Choose a mission</h2></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {data.missions.map((m, index) => <button key={m.id} type="button" onClick={() => setMissionIndex(index)} aria-current={missionIndex===index ? "step" : undefined}
            className={"min-h-24 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 " + (missionIndex===index?"border-cyan-300 bg-cyan-400/15":"border-slate-700 bg-slate-950/40 hover:bg-slate-800")}>
            <span className="flex items-center justify-between text-xs text-slate-400"><span>MISSION {m.number}</span>{state.completed.includes(m.id)?<Check className="text-emerald-300" size={16}/>:null}</span>
            <span className="mt-2 block text-sm font-semibold">{m.title}</span>
            <span className="mt-1 block text-xs text-cyan-200">{m.minutes} min</span>
          </button>)}
        </div>
      </section>

      <section className={card} aria-labelledby="lesson-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-300">{mission.eyebrow} · {mission.tag}</p>
          <button type="button" className={smallButton} onClick={() => speaking?stopSpeaking():speak(mission.title+". "+mission.reading.join(" "))}>
            {speaking?<VolumeX size={16} className="mr-2 inline"/>:<Volume2 size={16} className="mr-2 inline"/>}{speaking?"Stop audio":"Listen to lesson"}
          </button>
        </div>
        <h2 id="lesson-title" className="mt-3 text-2xl font-bold sm:text-3xl">{mission.number}. {mission.title}</h2>
        <p className="mt-2 rounded-lg bg-slate-800/75 p-3 text-sm text-cyan-100"><strong>You'll be able to:</strong> {mission.objective}</p>
        <div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-200">{mission.reading.map((p,i)=><p key={i}>{p}</p>)}</div>
        <div className="mt-4 flex flex-wrap gap-2">{mission.sourceIds.map(id=>{
          const s=data.sources.find(source=>source.id===id);
          return s?<a className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs text-cyan-200 hover:border-cyan-400" key={id} href={s.url} target="_blank" rel="noreferrer"><ExternalLink size={12}/>{s.title.length>36?s.title.slice(0,35)+"…":s.title}</a>:null;
        })}</div>
      </section>

      {mission.id==="intake"?<DetectiveMiniGames mode="safety" />:null}
      {mission.id==="categories"?<DetectiveMiniGames mode="symptoms" />:null}

      <section className={card} aria-labelledby="board-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Explore and investigate</p><h2 id="board-title" className="text-xl font-bold">Interactive virtual workbench</h2></div>
          <Wrench className="text-cyan-300"/>
        </div>
        <p className="mb-4 text-sm leading-6 text-slate-300">Select a hotspot on this <strong>original fictional circuit illustration</strong>, or use the labelled component list. It is not a schematic of an actual device.</p>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,.85fr)]">
          <div>
            <div className="relative aspect-[10/6.2] w-full overflow-hidden rounded-2xl border border-slate-600 bg-[#0a3438]">
              <svg viewBox="0 0 1000 620" className="h-full w-full" role="img" aria-label="Stylised fictional laptop circuit board with traces and components">
                <defs>
                  <pattern id="boarddots" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="#62d9bd" opacity=".25"/></pattern>
                  <linearGradient id="pcb" x1="0" x2="1"><stop stopColor="#103f47"/><stop offset="1" stopColor="#145143"/></linearGradient>
                </defs>
                <rect width="1000" height="620" rx="25" fill="url(#pcb)"/>
                <rect width="1000" height="620" fill="url(#boarddots)"/>
                {Array.from({length:13},(_,i)=><path key={i} d={"M 10 "+(28+i*45)+" H "+(60+i*14)+" v "+(14+i%3*10)+" H 970"} stroke="#50bc9d" strokeWidth="3" opacity=".29" fill="none"/>)}
                {Array.from({length:12},(_,i)=><circle key={i} cx={34+i*84} cy={i%2===0?22:592} r="7" fill="#d6b96f" stroke="#754c2d" strokeWidth="3"/>)}
                <rect x="56" y="82" width="875" height="490" rx="26" fill="none" stroke="#8dcab8" strokeWidth="5" opacity=".5"/>
                <text x="58" y="58" fill="#d8fffa" fontSize="26" fontWeight="bold" letterSpacing="3">SIM LAB / PCB-0001</text>
                <text x="65" y="608" fill="#d5f8eb" fontSize="17">DEMONSTRATION ONLY · NOT TO SCALE</text>
              </svg>
              {data.board.map((p,i)=><button key={p.id} type="button" title={p.name} aria-label={"Inspect "+p.name} aria-pressed={partId===p.id} onClick={()=>setPartId(p.id)}
                style={{left:p.x+"%",top:p.y+"%",width:p.w+"%",height:p.h+"%",borderColor:p.color,backgroundColor:partId===p.id?p.color+"50":"#0a1c2dc9"} as CSSProperties}
                className={"absolute flex items-center justify-center rounded-lg border-2 text-base font-black shadow-md outline-offset-2 hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white "+(partId===p.id?"ring-2 ring-white/60":"")}>
                <span className="rounded-full bg-slate-950/70 px-2 py-1 text-white">{i+1}</span>
              </button>)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{data.board.map((p,i)=><button key={p.id} type="button" aria-pressed={partId===p.id} onClick={()=>setPartId(p.id)} className={smallButton+(partId===p.id?" border-cyan-300 bg-slate-800":"")}>{i+1}. {p.name}</button>)}</div>
          </div>
          <aside className="rounded-xl border border-cyan-500/40 bg-[#102b3c] p-5" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">COMPONENT FILE</p>
            <h3 className="mt-3 text-xl font-bold">{selectedPart.name}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-200">{selectedPart.detail}</p>
            <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-300/10 p-3 text-sm"><strong className="text-amber-200">Board-ID rule:</strong> a retail model name does not establish a safe exact schematic match. Check physical board codes and revisions before real work.</div>
            <a className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-200 underline" target="_blank" rel="noreferrer" href="https://github.com/joshualparris/DubboEwaste/blob/main/docs/DEVICE-SCHEMATICS-LIBRARY.md">Explore actual schematic match research <ExternalLink size={13}/></a>
          </aside>
        </div>
      </section>

      <section className={card} aria-labelledby="lab-title">
        <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-300">CASEWORK GAME</p><h2 id="lab-title" className="text-2xl font-bold">The diagnostic lab</h2></div><ClipboardCheck className="text-emerald-300"/></div>
        <p className="mb-5 text-sm leading-6 text-slate-300">Three separate fictional laptops. Run virtual tests, select your two most useful recorded clues and diagnose the fault family. You cannot solve a case by simply guessing an answer.</p>
        <div role="group" aria-label="Case files" className="grid gap-2 sm:grid-cols-3">
          {data.cases.map(c=><button type="button" key={c.id} onClick={()=>changeCase(c.id)} aria-pressed={currentCase.id===c.id} className={"rounded-xl border p-3 text-left transition hover:border-cyan-300 "+(currentCase.id===c.id?"border-cyan-300 bg-cyan-400/15":"border-slate-700 bg-slate-950/60")}>
            <div className="flex items-center justify-between gap-2 text-xs text-cyan-200"><span>CASE {c.id.slice(-4).toUpperCase()}</span>{state.solved[c.id]?<Check size={16} className="text-emerald-300"/>:null}</div>
            <strong className="mt-2 block text-sm">{c.alias.split("/ ")[1]}</strong><span className="mt-2 block text-xs text-slate-400">{c.model}</span>
          </button>)}
        </div>
        <div className="my-5 rounded-xl border border-amber-400/35 bg-amber-300/10 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-200">INTAKE REPORT</p>
          <h3 className="mt-1 text-xl font-bold">{currentCase.alias}</h3>
          <p className="mt-2 font-semibold">{currentCase.symptom}</p>
          <p className="mt-2 text-sm text-slate-300">{currentCase.intro}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="toolpick" className="text-sm font-semibold">Tool station:</label>
          <select id="toolpick" className="min-w-36 rounded-lg border border-slate-500 bg-slate-900 p-2 text-sm" value={tool} onChange={e=>setTool(e.target.value)}>
            {Object.entries(labels).map(([key,value])=><option key={key} value={key}>{value}</option>)}
          </select>
          <label htmlFor="metermode" className="text-sm font-semibold">Virtual meter:</label>
          <select id="metermode" className="rounded-lg border border-slate-500 bg-slate-900 p-2 text-sm" value={meterMode} onChange={e=>setMeterMode(e.target.value)}>
            <option value="volts">DC volts</option><option value="ohms">Ω / continuity</option>
          </select>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{testOptions.map(test=><button type="button" key={test.id} onClick={()=>runTest(test.id)} className={smallButton+" flex min-h-16 items-center justify-between gap-3 text-left"}>
          <span><span className="block">{test.title}</span><small className="mt-1 block font-normal text-slate-400">{test.safe}</small></span>
          {observations.includes(test.id)?<Check size={18} className="shrink-0 text-emerald-300"/>:<ArrowRight size={17} className="shrink-0 text-cyan-200"/>}
        </button>)}</div>
        <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-200/10 p-4" aria-live="polite">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-200"><Lightbulb size={17}/> Latest virtual observation</div>
          <p className="mt-2 min-h-10 text-sm leading-6 text-slate-100">{latest||"Select a virtual test to record your first clue. There is no real equipment connected."}</p>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
            <h3 className="text-lg font-bold">Evidence notebook</h3>
            <p className="mt-1 text-xs text-slate-300">Tests recorded: {observations.length}. Tick the two observations that justify your verdict. Unsupported evidence is not allowed.</p>
            {observations.length===0?<p className="mt-4 text-sm text-slate-400">Your notebook is empty.</p>:<ul className="mt-3 space-y-3">{observations.map(id=>{const t=data.tests.find(z=>z.id===id);return <li key={id} className="rounded-lg border border-slate-700 p-3"><label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-cyan-300" checked={cited.includes(id)} onChange={()=>toggleEvidence(id)}/>
              <span><strong className="block text-sm">{t?.title??id}</strong><span className="mt-1 block text-xs leading-5 text-slate-300">{(currentCase.readings as Record<string,string>)[id]}</span></span>
            </label></li>})}</ul>}
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
            <h3 className="text-lg font-bold">Submit your verdict</h3>
            <p className="mt-2 text-sm text-slate-300">Choose the fault <em>family</em> best supported by your observations. Do not overclaim an exact component.</p>
            <label htmlFor="case-diagnosis" className="mt-4 block text-xs font-bold uppercase tracking-widest text-cyan-200">Likely fault family</label>
            <select id="case-diagnosis" className="mt-2 w-full rounded-lg border border-slate-500 bg-slate-900 p-3 text-sm" value={verdict[currentCase.id]??""} onChange={e=>{setVerdict(prev=>({...prev,[currentCase.id]:e.target.value}));setFeedback("");}}>
              <option value="">Choose a hypothesis…</option>{data.diagnoses.map(d=><option value={d.id} key={d.id}>{d.label}</option>)}
            </select>
            <button type="button" className="mt-4 w-full rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40" onClick={submitVerdict} disabled={Boolean(state.solved[currentCase.id])}>
              {state.solved[currentCase.id]?"Case solved":"Review evidence & submit"}
            </button>
            <p role="status" aria-live="polite" className="mt-3 min-h-10 text-sm leading-6 text-slate-200">{feedback||(state.solved[currentCase.id]?currentCase.reason:"Record two decisive observations, tick them in your notebook and commit a diagnosis.")}</p>
            <p className="text-sm font-semibold text-emerald-300">Mastery: {solvedCount} of 3 cases solved</p>
          </div>
        </div>
      </section>

      <section className={card} aria-labelledby="practice-title">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">PRACTICE + RETRIEVAL</p>
        <h2 id="practice-title" className="mt-2 text-2xl font-bold">Prove the mission's key idea</h2>
        <p className="mt-2 text-sm text-slate-300">Choose an answer in both challenges. You'll receive an explanation and can retry freely. Mission 8 additionally requires three solved case files.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {(["activity","check"] as AnswerKind[]).map((kind,i)=>{
            const q=mission[kind];const answer=state.answers[mission.id]?.[kind];const good=answer===q.answer;
            return <fieldset key={kind} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
              <legend className="px-1 text-xs font-bold uppercase tracking-widest text-cyan-200">{i===0?"Scenario activity":"Knowledge check"}</legend>
              <p className="mt-2 font-semibold leading-6">{"prompt" in q ? q.prompt : q.question}</p>
              <div className="mt-3 space-y-2">{q.options.map((o,index)=><label key={o} className={"flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm "+(answer===index?"border-cyan-400 bg-cyan-400/10":"border-slate-700 hover:bg-slate-800")}>
                <input type="radio" name={mission.id+"-"+kind} checked={answer===index} onChange={()=>updateAnswer(kind,index)} className="mt-1 h-4 w-4 accent-cyan-300"/><span>{o}</span>
              </label>)}</div>
              {answer!==undefined?<p role="status" className={"mt-3 text-sm leading-6 "+(good?"text-emerald-200":"text-amber-200")}>{good?"Correct. ":"Not quite. "}{"why" in q ? q.why : q.explanation}</p>:null}
            </fieldset>;
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" className="rounded-xl bg-emerald-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40" disabled={!canFinish} onClick={completeMission}>
            {state.completed.includes(mission.id)?"Revisit complete mission":mission.id==="final"?"Claim earned mastery":"Finish mission & continue"}
          </button>
          <span className="text-sm text-slate-300">{canFinish?(mission.id==="final"?"All case and quiz requirements are met.":"Both activities passed. Ready to continue."):(mission.id==="final"?"Solve all three lab cases and both questions.":"Pass both activities to complete this mission.")}</span>
        </div>
        <div className="mt-5 flex justify-between gap-3">
          <button type="button" className={smallButton} disabled={missionIndex===0} onClick={()=>setMissionIndex(i=>Math.max(0,i-1))}><ArrowLeft size={15} className="mr-1 inline"/> Previous</button>
          <button type="button" className={smallButton} disabled={missionIndex===data.missions.length-1} onClick={()=>setMissionIndex(i=>Math.min(data.missions.length-1,i+1))}>Next lesson <ArrowRight size={15} className="ml-1 inline"/></button>
        </div>
      </section>

      <section className={card} aria-labelledby="media-title">
        <div className="mb-4 flex items-center gap-2"><Headphones className="text-cyan-300"/><h2 id="media-title" className="text-2xl font-bold">Media studio: watch, listen, inspect</h2></div>
        <p className="mb-4 text-sm text-slate-300">This library contains real externally published resources. Videos and podcasts are optional extensions, not a substitute for casework. Availability and captions depend on their publishers.</p>
        <div role="tablist" aria-label="Media resources" className="mb-4 flex flex-wrap gap-2">
          {(["video","audio","photo"] as const).map(x=><button type="button" role="tab" aria-selected={mediaTab===x} className={smallButton+(mediaTab===x?" border-cyan-300 bg-slate-800":"")} key={x} onClick={()=>setMediaTab(x)}>{x==="audio"?"Audio & podcasts":x==="video"?"Real videos":"Real hardware photo"}</button>)}
        </div>
        {mediaTab==="video"?<div className="grid gap-5 lg:grid-cols-2">
          <div><div className="aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-950"><iframe className="h-full w-full" src="https://www.youtube-nocookie.com/embed/DrIuj47bqX0" title="How to upgrade RAM on Lenovo ThinkPad L480, TechNTechie" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div><p className="mt-2 text-sm font-semibold">{data.media.videoTitle}</p><p className="mt-2 text-xs text-slate-300">Embedded video may be blocked by the video provider or browser. <a className="text-cyan-200 underline" href={data.media.videoUrl} target="_blank" rel="noreferrer">Open directly on YouTube ↗</a></p></div>
          <div className="space-y-3"><h3 className="text-xl font-bold">Watch with a purpose</h3><p className="text-sm leading-6">Before watching, predict what must be isolated before touching a memory module. While watching, identify how the technician locates compatible RAM. Afterwards, list two differences between *seeing where RAM is* and safely replacing it.</p>
            <a className="block rounded-lg border border-cyan-500/40 p-3 text-sm text-cyan-200 underline" href="https://support.lenovo.com/pr/en/solutions/HT511079" target="_blank" rel="noreferrer">Lenovo official L480 removal and replacement video catalogue ↗</a>
            <a className="block rounded-lg border border-cyan-500/40 p-3 text-sm text-cyan-200 underline" href="https://www.youtube.com/watch?v=wfi_3AAOUxI" target="_blank" rel="noreferrer">Second teardown demonstration: Notebook-Doktor L480 ↗</a>
            <p className="text-xs text-amber-200">These are genuine external links checked at research time, not locally hosted or independently reviewed for every spoken instruction. Consult Lenovo's manual for safety.</p></div>
        </div>:null}
        {mediaTab==="audio"?<div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-700 p-4"><h3 className="text-lg font-bold">Original bench briefing · text-to-speech</h3><p className="mt-2 text-sm leading-6">{data.media.narration}</p><button type="button" className={smallButton+" mt-3"} onClick={()=>speaking?stopSpeaking():speak(data.media.narration)}>{speaking?"Stop narration":"Play narration in browser"}</button><p className="mt-2 text-xs text-slate-400">Generated locally using your browser's speech engine. It is not a recorded podcast and may be unavailable on some devices.</p></div>
          <div className="rounded-xl border border-slate-700 p-4"><h3 className="text-lg font-bold">Repair stories · real podcast</h3><p className="mt-2 text-sm">{data.media.podcastTitle}</p><p className="mt-2 text-sm leading-6">Hear how a community repair group approaches extending laptop life. Listening question: what makes a local reuse initiative different from a commercial repair warranty service?</p><a className="mt-4 inline-flex items-center gap-2 rounded-lg border border-cyan-500/50 p-3 text-sm text-cyan-200 underline" target="_blank" rel="noreferrer" href={data.media.podcastUrl}>Listen on Apple Podcasts <ExternalLink size={14}/></a><a className="mt-3 block text-sm text-cyan-200 underline" target="_blank" rel="noreferrer" href="https://therestartproject.org/podcast/">Explore Restart Radio's episode archive ↗</a></div>
        </div>:null}
        {mediaTab==="photo"?<figure className="max-w-3xl"><p className="mb-3 text-sm text-cyan-100">Compare this board <strong>with RAM installed</strong> against the same board <strong>with the two slots empty</strong>. These are real X220 photos, not the simulated L480 circuit.</p><div className="overflow-hidden rounded-xl border border-slate-700 bg-[#08182a]">{!photoError?<img src={data.media.imageUrl} onError={()=>setPhotoError(true)} alt="Real Lenovo ThinkPad X220 motherboard with RAM slots, heat pipes and connected components, a different model from the simulated board" className="max-h-[450px] w-full object-contain" loading="lazy"/>:<p className="p-8 text-sm">The externally hosted photograph could not be loaded. The original annotated board and the source file link remain available.</p>}</div><figcaption className="mt-3 text-sm text-slate-300">{data.media.imageCaption} <a className="text-cyan-200 underline" href={data.media.imageSource} target="_blank" rel="noreferrer">See image, author, attribution and licence ↗</a></figcaption><div className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-[#08182a]"><img src={data.media.imageEmptyUrl} alt="Same Lenovo X220 motherboard with both SO-DIMM memory slots empty" className="max-h-[450px] w-full object-contain" loading="lazy"/></div><p className="mt-2 text-xs text-slate-300">Second photograph: Siarhei V, CC BY-SA 4.0, no modifications. <a className="text-cyan-200 underline" href={data.media.imageEmptySource} target="_blank" rel="noreferrer">Original and licence ↗</a></p><p className="mt-3 text-sm">Challenge: locate the two RAM slots, copper-coloured cooling assembly and processor area. Which details would you verify before using any schematic on a different laptop?</p></figure>:null}
      </section>

      <section className={card} aria-labelledby="source-title">
        <details>
          <summary className="flex cursor-pointer items-center gap-2 text-xl font-bold"><BookOpen className="text-emerald-300"/> Sources, verification and safety <ChevronDown size={16}/></summary>
          <p className="mt-4 text-sm leading-6">This learning module uses independently published manufacturer documentation and repair guidance, plus your own schematic research. Individual readings, cases, circuit diagram, customer stories and fault verdicts are **fictional teaching examples**, not verified faults in an owned laptop. Image and external videos retain the publisher's rights.</p>
          <ul className="mt-4 space-y-3">{data.sources.map(s=><li key={s.id} className="rounded-lg border border-slate-700 p-3 text-sm"><a className="font-semibold text-cyan-200 underline" href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><p className="mt-1 text-xs text-slate-300">{s.kind} · {s.note}</p></li>)}</ul>
        </details>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className={smallButton} onClick={()=>{
            const payload=JSON.stringify({course:data.title,version:data.version,completed:state.completed,solved:state.solved,exported:new Date().toISOString()},null,2);
            const blob=new Blob([payload],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="dead-laptop-detective-progress.json";a.click();URL.revokeObjectURL(url);
          }}>Export learning progress</button>
          <button type="button" className={smallButton} onClick={()=>{if(window.confirm("Clear all progress, notes and solved cases for this course on this browser?")){setState(emptyState);setLatest("");setFeedback("");setVerdict({});setMissionIndex(0);}}}><RotateCcw size={14} className="mr-1 inline"/> Reset course</button>
        </div>
      </section>
    </div>
  </div>;
}
