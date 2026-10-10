/**
 * Adaptive learning is practice routing, not evidence of professional competence.
 * Start at Practitioner (2). Three correct responses promote one tier;
 * two wrong answers in a three-response window lower one tier.
 * Reset the window at transitions to avoid oscillation. No timing/age/IQ inference.
 */
export type Difficulty = 1 | 2 | 3;
export type AdaptiveState = {
  level: Difficulty;
  recent: boolean[];
  attempts: number;
  correct: number;
  seen: string[];
};
export type Challenge = {
  id: string;
  level: Difficulty;
  question: string;
  options: [string,string,string];
  answer: 0|1|2;
  explanation: string;
  topic?: string;
  programme?: string;
  safety?: boolean;
};
export const initialAdaptiveState = (): AdaptiveState => ({
  level: 2, recent: [], attempts: 0, correct: 0, seen: []
});
export function adapt(state: AdaptiveState, correct: boolean, id: string): AdaptiveState {
  const recent = [...state.recent, correct].slice(-3);
  let level: Difficulty = state.level;
  const successes = recent.filter(Boolean).length;
  if (recent.length === 3 && successes === 3 && level < 3) level = (level + 1) as Difficulty;
  if (recent.length >= 2 && recent.length - successes >= 2 && level > 1) level = (level - 1) as Difficulty;
  return {
    level, recent: level !== state.level ? [] : recent,
    attempts: state.attempts + 1,
    correct: state.correct + (correct ? 1 : 0),
    seen: [...new Set([...state.seen, id])].slice(-300)
  };
}
export function pickChallenge<T extends Challenge>(
  bank: readonly T[], state: AdaptiveState, topic?: string
): T | null {
  const unattempted = bank.filter(q => !state.seen.includes(q.id));
  if (!unattempted.length) return null; // never recycle memorised choices for apparent mastery
  const candidates = unattempted.slice().sort((a,b) => {
    const score = (q:T) =>
      (q.level === state.level ? 0 : Math.abs(q.level-state.level)*10) +
      (topic && q.topic === topic ? -5 : 0);
    return score(a)-score(b);
  });
  return candidates[0] ?? null;
}
export function parseAdaptiveState(raw: string|null): AdaptiveState {
  if (!raw) return initialAdaptiveState();
  try {
    const x = JSON.parse(raw) as Partial<AdaptiveState>;
    if (![1,2,3].includes(Number(x.level))) return initialAdaptiveState();
    return {
      level: x.level as Difficulty,
      recent: Array.isArray(x.recent) ? x.recent.filter((v):v is boolean => typeof v === "boolean").slice(-3) : [],
      attempts: typeof x.attempts === "number" && Number.isFinite(x.attempts) ? Math.max(0,x.attempts) : 0,
      correct: typeof x.correct === "number" && Number.isFinite(x.correct) ? Math.max(0,x.correct) : 0,
      seen: Array.isArray(x.seen) ? x.seen.filter((v):v is string => typeof v === "string").slice(-300) : []
    };
  } catch { return initialAdaptiveState(); }
}
export const levelLabel = (level: Difficulty) => ({1:"Foundation",2:"Practitioner",3:"Expert"})[level];
