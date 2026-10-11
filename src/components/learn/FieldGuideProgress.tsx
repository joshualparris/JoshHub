"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db/dexie";
import extraBank from "@/data/field-guide-adaptive-challenges.json";
import { combineReasoning, type AssessmentStatus } from "@/lib/learning/assessment-dialogue";
import { initialAdaptiveRecord, nextAdaptiveRecord, labelDifficulty, type Difficulty, type AdaptiveRecord } from "@/lib/learning/adaptive-difficulty";

type Check = { question: string; options: string[]; answer: number; explanation: string };
type Lesson = { id: string; title: string; check: Check };
const bank = extraBank.variants as Record<string, {guided: Check; expert: Check}>;
function activeChallenge(lesson:Lesson, storageKey:string, level:Difficulty):Check {
 const prefix = storageKey.includes("ewaste-outreach") ? "outreach-" : "business-";
 const variants = bank[prefix+lesson.id];
 if(level===1 && variants) return variants.guided;
 if(level===3 && variants) return variants.expert;
 return lesson.check;
}
type Review = { interval: number; nextDue: number; attempts: number; lastCorrect: boolean };
type ReviewMap = Record<string, Review>;
type GradeFeedback = {passed:boolean;status:AssessmentStatus;summary:string;improvement:string;followUpQuestion?:string|null;creativeAlternative?:boolean;independent:boolean;dimensions?:Record<string,number>};
const defaultKey = "field-guide:dubbo-businesses:2026-10-11.3";
const intervalDays = [1, 3, 7, 14, 30, 60];

export default function FieldGuideProgress({ lessons, storageKey = defaultKey }: { lessons: Lesson[]; storageKey?: string }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [recall, setRecall] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gradingId,setGradingId] = useState<string|null>(null);
  const [grades,setGrades] = useState<Record<string,GradeFeedback>>({});
  const [followUps,setFollowUps] = useState<Record<string,string>>({});
  const [assisted,setAssisted] = useState<Record<string,boolean>>({});
  const [gradeErrors,setGradeErrors] = useState<Record<string,string>>({});
  const [adaptive, setAdaptive] = useState<AdaptiveRecord>(initialAdaptiveRecord);
  const [selectedLevels, setSelectedLevels] = useState<Record<string, Difficulty>>({});
  const [error, setError] = useState("");
  const reviewKey = storageKey + ":reviews:v1";
  const adaptiveKey = storageKey + ":adaptive:v2";

  useEffect(() => {
    let active = true;
    setReady(false);
    Promise.all([db.learnSettings.get(storageKey), db.learnSettings.get(reviewKey), db.learnSettings.get(adaptiveKey)])
      .then(([progress, savedReviews, savedAdaptive]) => {
        if (!active) return;
        const ids: unknown = progress ? JSON.parse(progress.value) : [];
        const stored: unknown = savedReviews ? JSON.parse(savedReviews.value) : {};
        const validIds = new Set(lessons.map((lesson) => lesson.id));
        setCompleted(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string" && validIds.has(id)) : []);
        const next: ReviewMap = {};
        if (stored && typeof stored === "object" && !Array.isArray(stored)) {
          for (const [id, value] of Object.entries(stored)) {
            if (!validIds.has(id) || !value || typeof value !== "object") continue;
            const row = value as Partial<Review>;
            if (typeof row.nextDue === "number" && Number.isFinite(row.nextDue) && typeof row.interval === "number" && Number.isFinite(row.interval) && typeof row.attempts === "number" && Number.isFinite(row.attempts)) {
              next[id] = { nextDue: row.nextDue!, interval: row.interval!, attempts: row.attempts!, lastCorrect: row.lastCorrect === true };
            }
          }
        }
        setReviews(next);
        try {
          const a: Partial<AdaptiveRecord> = savedAdaptive ? JSON.parse(savedAdaptive.value) : {};
          setAdaptive(a && [1,2,3].includes(a.level ?? 0) && Array.isArray(a.window) && typeof a.attempts==="number" ? {level:a.level as Difficulty,window:a.window.filter((v): v is boolean=>typeof v==="boolean").slice(-1),attempts:a.attempts} : initialAdaptiveRecord());
        } catch { setAdaptive(initialAdaptiveRecord()); }
        setReady(true);
      }).catch(() => {
        if (active) {
          setReady(true);
          setError("Previous progress could not be loaded. Avoid resetting your browser until this is resolved.");
        }
      });
    return () => { active = false; };
  }, [lessons, storageKey, reviewKey, adaptiveKey]);

  async function saveProgress(next: string[], nextReviews: ReviewMap, nextAdaptive:AdaptiveRecord = adaptive) {
    setBusy(true);
    try {
      await db.transaction("rw", db.learnSettings, async () => {
        await db.learnSettings.put({ key: storageKey, value: JSON.stringify(next), updatedAt: Date.now() });
        await db.learnSettings.put({ key: reviewKey, value: JSON.stringify(nextReviews), updatedAt: Date.now() });
        await db.learnSettings.put({ key: adaptiveKey, value: JSON.stringify(nextAdaptive), updatedAt: Date.now() });
      });
      setCompleted(next);
      setReviews(nextReviews);
      setAdaptive(nextAdaptive);
      setError("");
      return true;
    } catch {
      setError("Your progress was not saved. Check browser storage and try again.");
      return false;
    } finally { setBusy(false); }
  }

  function choose(id: string, answer: number) {
    setSelectedLevels(current=> current[id] ? current : {...current,[id]:adaptive.level});
    setAnswers((current) => ({ ...current, [id]: answer }));
    setChecked((current) => ({ ...current, [id]: false }));
    setGrades(current=>{const next={...current};delete next[id];return next;});
    setGradeErrors(current=>({...current,[id]:""}));
    setFollowUps(current=>({...current,[id]:""}));
  }

  async function checkLesson(lesson: Lesson) {
    if(busy||gradingId)return;
    const original=recall[lesson.id]?.trim()??"";
    if(!original){setGradeErrors(v=>({...v,[lesson.id]:"Tell me what you would do, even briefly."}));return;}
    const awaiting=grades[lesson.id]?.status==="clarify"&&!grades[lesson.id]?.passed;
    const followUp=followUps[lesson.id]?.trim()??"";
    if(awaiting&&!followUp)return;
    const draft=awaiting?combineReasoning(original,followUp):original;
    const level=selectedLevels[lesson.id]??adaptive.level;
    setSelectedLevels(v=>v[lesson.id]?v:{...v,[lesson.id]:level});
    setGradingId(lesson.id);setGradeErrors(v=>({...v,[lesson.id]:""}));
    try{
      const response=await fetch("/api/learning/grade",{
        method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
        body:JSON.stringify({
          kind:"research",course:storageKey.includes("ewaste-outreach")?"outreach":"business",
          lessonId:lesson.id,level,selected:answers[lesson.id]??null,response:draft
        })
      });
      const result=await response.json() as {passed?:boolean;status?:AssessmentStatus;summary?:string;improvement?:string;followUpQuestion?:string|null;creativeAlternative?:boolean;error?:string;dimensions?:Record<string,number>};
      if(!response.ok){
        setGradeErrors(v=>({...v,[lesson.id]:result.error??result.summary??"Grading unavailable; no attempt scored."}));
        return;
      }
      if(!result.status || !["pass","clarify","revise"].includes(result.status)){
        setGradeErrors(v=>({...v,[lesson.id]:"The grader returned an incomplete assessment; no progress awarded."}));return;
      }
      const passed=result.passed===true && result.status==="pass";
      const independent=passed&&!assisted[lesson.id]&&!awaiting;
      if(awaiting){setRecall(v=>({...v,[lesson.id]:draft}));setFollowUps(v=>({...v,[lesson.id]:""}));}
      if(!passed)setAssisted(v=>({...v,[lesson.id]:true}));
      setGrades(v=>({...v,[lesson.id]:{passed,status:result.status!,summary:result.summary??"Assessment complete.",improvement:result.improvement??"Explain how your idea addresses the actual situation.",followUpQuestion:result.followUpQuestion,creativeAlternative:result.creativeAlternative,independent,dimensions:result.dimensions}}));
      setChecked(v=>({...v,[lesson.id]:true}));
      if(passed){
        const nextAdaptive=nextAdaptiveRecord(adaptive,independent);
        if(completed.includes(lesson.id)){
          const old=reviews[lesson.id];
          const nextIndex=independent?Math.min((old?.interval??-1)+1,intervalDays.length-1):0;
          const now=Date.now();
          const updated:ReviewMap={...reviews,[lesson.id]:{
            interval:nextIndex,nextDue:now+intervalDays[nextIndex]*86400000,
            attempts:(old?.attempts??0)+1,lastCorrect:independent
          }};
          await saveProgress(completed,updated,nextAdaptive);
        }else{
          await saveProgress(completed,reviews,nextAdaptive);
        }
      }
    }catch{
      setGradeErrors(v=>({...v,[lesson.id]:"Could not reach the AI grader; no assessment was recorded."}));
    }finally{setGradingId(null);}
  }

  async function toggleLesson(id: string) {
    if (!ready || busy) return;
    const done = completed.includes(id);
    if (!done && !(checked[id] && grades[id]?.passed===true)) return;
    const next = done ? completed.filter((item) => item !== id) : [...completed, id];
    const now = Date.now();
    const nextReviews = done ? reviews : { ...reviews, [id]: { interval: 0, nextDue: now + 86400000, attempts: 1, lastCorrect: true } };
    await saveProgress(next, nextReviews);
  }

  const due = completed.filter((id) => !reviews[id] || reviews[id].nextDue <= Date.now()).length;

  return <section aria-labelledby="checks-title" className="space-y-6 rounded-xl border p-5">
    <header>
      <h2 id="checks-title" className="text-2xl font-semibold">Recall, check and review</h2>
      <p className="mt-2">Write your reasoning first. Creative safe alternatives are welcome: AI may ask one specific follow-up instead of marking a short answer wrong.</p>
      <p className="mt-2 text-sm font-medium">Current challenge tier: {labelDifficulty(adaptive.level)}. Strong independent answers raise difficulty; a guided response is valuable learning but does not count as independent mastery.</p>
      <p className="mt-2">{completed.length} of {lessons.length} lessons complete · {due} due for review.</p>
      <progress className="mt-3 w-full" value={completed.length} max={lessons.length} aria-label="Lessons completed" />
      <p className="text-sm">Your draft is sent to Groq only when you submit it. Avoid confidential information. Your writing is not saved by JoshHub; only learning status is stored locally. When AI is unavailable, no new mastery is awarded.</p>
      <p className="text-sm">Reviews are scheduled after 1, 3, 7, 14, 30 and 60 days. Progress stays in this browser, not across devices.</p>
      {error ? <p role="alert" className="mt-2">{error}</p> : null}
    </header>
    {lessons.map((lesson) => {
      const selected = answers[lesson.id];
      const questionLevel = selectedLevels[lesson.id] ?? adaptive.level;
      const challenge = activeChallenge(lesson, storageKey, questionLevel);
      const wasChecked = checked[lesson.id] === true;
      const correct = grades[lesson.id]?.passed===true;
      const needsFollowUp = grades[lesson.id]?.status==="clarify" && !correct;
      const needsRevision = grades[lesson.id]?.status==="revise" && !correct;
      const done = completed.includes(lesson.id);
      const scheduled = reviews[lesson.id]?.nextDue;
      const dueNow = done && (!scheduled || scheduled <= Date.now());
      return <article key={lesson.id} className="space-y-3 border-t pt-5">
        <h3 className="font-semibold"><a className="underline" href={"#lesson-" + lesson.id}>{lesson.title}</a></h3>
        {done ? <p className="text-sm">{dueNow ? "Review due now" : "Next review: " + new Date(scheduled ?? Date.now()).toLocaleDateString("en-AU")}</p> : null}
        <label className="block font-medium" htmlFor={"recall-" + lesson.id}>What would you do, and why? Short thoughtful answers are fine.</label>
        <textarea id={"recall-" + lesson.id} rows={2} className="w-full rounded border p-3" value={recall[lesson.id] ?? ""}
          maxLength={2400} disabled={correct||needsFollowUp||Boolean(gradingId)} onChange={(event) => {setRecall(current=>({...current,[lesson.id]:event.target.value}));setChecked(current=>({...current,[lesson.id]:false}));setGradeErrors(current=>({...current,[lesson.id]:""}));if(grades[lesson.id])setAssisted(current=>({...current,[lesson.id]:true}));}}
          placeholder="My plan is… because…" />
        <fieldset className="space-y-2" disabled={Boolean(gradingId)||needsFollowUp||correct}>
          <legend className="mb-2 font-medium">{challenge.question} <span className="block mt-1 text-xs font-normal opacity-70">{labelDifficulty(questionLevel)} · listed options are optional comparisons, not a grading key</span></legend>
          {challenge.options.map((option, index) => <label key={index} className="flex cursor-pointer items-start gap-3 rounded border p-3">
            <input type="radio" className="mt-1" name={"check-" + lesson.id} checked={selected === index} onChange={() => choose(lesson.id, index)} />
            <span>{option}</span>
          </label>)}
        </fieldset>
        {!needsFollowUp && !correct && !needsRevision ? <button type="button" className="rounded border px-4 py-2 disabled:opacity-50" disabled={!ready || busy || Boolean(gradingId) || !(recall[lesson.id]??"").trim()}
          onClick={() => void checkLesson(lesson)}>{gradingId===lesson.id?"Assessing your reasoning…":"Assess my reasoning"}</button> : null}
        {gradeErrors[lesson.id]?<p role="alert" className="rounded border border-amber-500 p-3 text-sm">{gradeErrors[lesson.id]}</p>:null}
        {wasChecked && grades[lesson.id] ? <div role="status" className="space-y-3 rounded border p-3 text-sm">
          <p className="font-semibold">{correct?(grades[lesson.id].independent?"Independent reasoning demonstrated.":"Good progress with a follow-up.") : needsFollowUp?"Promising idea: one point needs checking.":"Let's revise that plan."} {grades[lesson.id].summary}</p>
          <p><strong>Next step:</strong> {grades[lesson.id].improvement}</p>
          {grades[lesson.id].creativeAlternative?<p>Your independent alternative was considered on its merits.</p>:null}
          {needsFollowUp?<div className="space-y-2">
            <label className="block font-medium" htmlFor={"follow-up-"+lesson.id}>{grades[lesson.id].followUpQuestion || "What condition would make this plan safe and authorised?"}</label>
            <textarea id={"follow-up-"+lesson.id} className="w-full rounded border p-3" rows={2} maxLength={950}
              placeholder="A brief clarification is fine…" value={followUps[lesson.id]??""} onChange={e=>setFollowUps(v=>({...v,[lesson.id]:e.target.value}))}/>
            <button type="button" className="rounded border px-4 py-2 disabled:opacity-50" disabled={Boolean(gradingId)||!followUps[lesson.id]?.trim()} onClick={()=>void checkLesson(lesson)}>{gradingId===lesson.id?"Reviewing…":"Send clarification"}</button>
          </div>:null}
          {needsRevision?<button type="button" className="rounded border px-4 py-2" onClick={()=>{setGrades(v=>{const n={...v};delete n[lesson.id];return n;});setChecked(v=>({...v,[lesson.id]:false}));setAssisted(v=>({...v,[lesson.id]:true}));}}>Revise my answer</button>:null}
          {grades[lesson.id].dimensions?<p>Rubric (out of 4): understanding {grades[lesson.id]?.dimensions?.understanding}, evidence {grades[lesson.id]?.dimensions?.evidence}, alternatives {grades[lesson.id]?.dimensions?.alternatives}, judgement {grades[lesson.id]?.dimensions?.risk}.</p>:null}
          {correct?<p>Reference approach: {challenge.explanation}</p>:null}
        </div> : null}
        <div>
          <button type="button" className="rounded border px-4 py-2 disabled:opacity-50"
            disabled={!ready || busy || Boolean(gradingId) || (!done && !(wasChecked && correct))}
            onClick={() => void toggleLesson(lesson.id)}>
            {done ? "Reopen lesson" : "Mark lesson complete"}
          </button>
        </div>
        {wasChecked && done ? <p className="text-sm">Your AI-assessed review was recorded. Weak explanations bring the next review forward.</p> : null}
      </article>;
    })}
  </section>;
}
