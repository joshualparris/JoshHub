"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db/dexie";

type Check = { question: string; options: string[]; answer: number; explanation: string };
type Lesson = { id: string; title: string; check: Check };
const key = "field-guide:dubbo-businesses:2026-10-10.1";

export default function FieldGuideProgress({ lessons, storageKey = key }: { lessons: Lesson[]; storageKey?: string }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    db.learnSettings.get(storageKey).then((row) => {
      if (!active) return;
      const value: unknown = row ? JSON.parse(row.value) : [];
      if (Array.isArray(value)) setCompleted(value.filter((id): id is string => typeof id === "string" && lessons.some((lesson) => lesson.id === id)));
      setReady(true);
    }).catch(() => {
      if (active) setError("Saved progress could not be loaded. You can still read the lessons and answer the checks.");
    });
    return () => { active = false; };
  }, [lessons, storageKey]);

  async function toggle(id: string) {
    if (!ready || busy) return;
    setBusy(true);
    const next = completed.includes(id) ? completed.filter((x) => x !== id) : [...completed, id];
    try {
      await db.learnSettings.put({ key: storageKey, value: JSON.stringify(next), updatedAt: Date.now() });
      setCompleted(next);
      setError("");
    } catch {
      setError("Progress was not saved. Check that browser storage is available, then try again.");
    } finally { setBusy(false); }
  }

  return <section aria-labelledby="checks-title" className="space-y-6 rounded-xl border p-5">
    <div>
      <h2 id="checks-title" className="text-2xl font-semibold">Knowledge checks & progress</h2>
      <p className="mt-2">{completed.length} of {lessons.length} lessons completed. Progress is saved in this browser, not synced across devices.</p>
      <progress className="mt-3 w-full" value={completed.length} max={lessons.length} aria-label="Lessons completed" />
      {error ? <p role="alert" className="mt-2">{error}</p> : null}
    </div>
    {lessons.map((lesson) => {
      const selected = answers[lesson.id];
      const correct = selected === lesson.check.answer;
      const done = completed.includes(lesson.id);
      return <div key={lesson.id} className="border-t pt-5">
        <a href={`#lesson-${lesson.id}`} className="underline">{lesson.title}</a>
        <fieldset className="mt-3 space-y-2">
          <legend className="mb-2 font-medium">{lesson.check.question}</legend>
          {lesson.check.options.map((option, index) => <label key={option} className="flex cursor-pointer items-start gap-3 rounded border p-3">
            <input type="radio" name={`check-${lesson.id}`} className="mt-1" checked={selected === index} onChange={() => setAnswers((current) => ({ ...current, [lesson.id]: index }))} />
            <span>{option}</span>
          </label>)}
        </fieldset>
        {selected !== undefined ? <p role="status" className="mt-3">{correct ? "Correct. " : "Try again. "}{lesson.check.explanation}</p> : null}
        <button type="button" className="mt-3 rounded border px-4 py-2 disabled:opacity-50" disabled={!ready || busy || (!done && !correct)} onClick={() => toggle(lesson.id)}>
          {done ? "Reopen lesson" : "Practice finished — mark complete"}
        </button>
      </div>;
    })}
  </section>;
}
