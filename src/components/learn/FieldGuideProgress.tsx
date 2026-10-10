"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db/dexie";
import extraBank from "@/data/field-guide-adaptive-challenges.json";
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
type GradeFeedback = {passed:boolean;summary:string;improvement:string;dimensions?:Record<string,number>};
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
  }

  async function checkLesson(lesson: Lesson) {
    if (answers[lesson.id] === undefined || busy || gradingId) return;
    const draft=recall[lesson.id]?.trim()??"";
    if(!draft){setGradeErrors(v=>({...v,[lesson.id]:"Please explain why the decision is warranted by the case evidence."}));return;}
    const level=selectedLevels[lesson.id]??adaptive.level;
    setGradingId(lesson.id);setGradeErrors(v=>({...v,[lesson.id]:""}));
    try{
      const response=await fetch("/api/learning/grade",{
        method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
        body:JSON.stringify({
          kind:"research",course:storageKey.includes("ewaste-outreach")?"outreach":"business",
          lessonId:lesson.id,level,selected:answers[lesson.id],response:draft
        })
      });
      const result=await response.json() as {passed?:boolean;summary?:string;improvement?:string;error?:string;dimensions?:Record<string,number>};
      if(!response.ok){
        setGradeErrors(v=>({...v,[lesson.id]:result.error??result.summary??"Grading unavailable; no attempt scored."}));
        return;
      }
      const passed=result.passed===true;
      const nextAdaptive=nextAdaptiveRecord(adaptive,passed);
      setGrades(v=>({...v,[lesson.id]:{passed,summary:result.summary??"Assessment complete.",improvement:result.improvement??"Explain the specific evidence and one alternative.",dimensions:result.dimensions}}));
      setChecked(v=>({...v,[lesson.id]:true}));
      if(completed.includes(lesson.id)){
        const old=reviews[lesson.id];
        const nextIndex=passed?Math.min((old?.interval??-1)+1,intervalDays.length-1):0;
        const now=Date.now();
        const updated:ReviewMap={...reviews,[lesson.id]:{
          interval:nextIndex,nextDue:now+intervalDays[nextIndex]*86400000,
          attempts:(old?.attempts??0)+1,lastCorrect:passed
        }};
        await saveProgress(completed,updated,nextAdaptive);
      }else {
        await saveProgress(completed,reviews,nextAdaptive);
      }
    }catch{
      setGradeErrors(v=>({...v,[lesson.id]:"Could not connect to Groq. No attempt has been scored."}));
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
      <p className="mt-2">Choose the best-supported decision, then <strong>justify it in your own words</strong>. A correct option alone no longer completes a lesson.</p>
      <p className="mt-2 text-sm font-medium">Current challenge tier: {labelDifficulty(adaptive.level)}. Two strong responses raise the difficulty; two mistakes offer a more guided case. No childish distractors.</p>
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
      const done = completed.includes(lesson.id);
      const scheduled = reviews[lesson.id]?.nextDue;
      const dueNow = done && (!scheduled || scheduled <= Date.now());
      return <article key={lesson.id} className="space-y-3 border-t pt-5">
        <h3 className="font-semibold"><a className="underline" href={"#lesson-" + lesson.id}>{lesson.title}</a></h3>
        {done ? <p className="text-sm">{dueNow ? "Review due now" : "Next review: " + new Date(scheduled ?? Date.now()).toLocaleDateString("en-AU")}</p> : null}
        <label className="block font-medium" htmlFor={"recall-" + lesson.id}>Before submitting, explain the evidence, a credible alternative, and your uncertainty.</label>
        <textarea id={"recall-" + lesson.id} rows={2} className="w-full rounded border p-3" value={recall[lesson.id] ?? ""}
          maxLength={2400} onChange={(event) => {setRecall(current=>({...current,[lesson.id]:event.target.value}));setChecked(current=>({...current,[lesson.id]:false}));setGradeErrors(current=>({...current,[lesson.id]:""}));}}
          placeholder="Try an answer in your own words before selecting an option. This draft isn't saved." />
        <fieldset className="space-y-2">
          <legend className="mb-2 font-medium">{challenge.question} <span className="block mt-1 text-xs font-normal opacity-70">{labelDifficulty(questionLevel)}</span></legend>
          {challenge.options.map((option, index) => <label key={index} className="flex cursor-pointer items-start gap-3 rounded border p-3">
            <input type="radio" className="mt-1" name={"check-" + lesson.id} checked={selected === index} onChange={() => choose(lesson.id, index)} />
            <span>{option}</span>
          </label>)}
        </fieldset>
        <button type="button" className="rounded border px-4 py-2 disabled:opacity-50" disabled={!ready || busy || Boolean(gradingId) || selected === undefined || wasChecked || !(recall[lesson.id]??"").trim()}
          onClick={() => void checkLesson(lesson)}>{gradingId===lesson.id?"Groq is grading…":"Grade reasoning with AI"}</button>
        {gradeErrors[lesson.id]?<p role="alert" className="rounded border border-amber-500 p-3 text-sm">{gradeErrors[lesson.id]}</p>:null}
        {wasChecked && grades[lesson.id] ? <div role="status" className="space-y-2 rounded border p-3 text-sm">
          <p className="font-semibold">{correct?"Evidence-based reasoning accepted.":"Reasoning needs more work."} {grades[lesson.id].summary}</p>
          <p><strong>Improve:</strong> {grades[lesson.id].improvement}</p>
          {grades[lesson.id].dimensions?<p>Rubric (out of 4): understanding {grades[lesson.id]?.dimensions?.understanding}, evidence {grades[lesson.id]?.dimensions?.evidence}, alternatives {grades[lesson.id]?.dimensions?.alternatives}, judgement {grades[lesson.id]?.dimensions?.risk}.</p>:null}
          <p>{challenge.explanation}</p>
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
