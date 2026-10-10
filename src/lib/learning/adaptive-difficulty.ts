/** Challenge selection is based on evidence of performance, not age or an IQ estimate. */
export type Difficulty = 1 | 2 | 3;
export type AdaptiveRecord = { level: Difficulty; window: boolean[]; attempts: number };
export const initialAdaptiveRecord = (): AdaptiveRecord => ({ level:2, window:[], attempts:0 });
export function nextAdaptiveRecord(previous: AdaptiveRecord, correct:boolean): AdaptiveRecord {
 const window=[...previous.window.slice(-1),correct];
 if(window.length<2) return {...previous,window,attempts:previous.attempts+1};
 const level:Difficulty=window.every(Boolean)?Math.min(3,previous.level+1) as Difficulty:
  window.every(v=>!v)?Math.max(1,previous.level-1) as Difficulty:previous.level;
 return {level,window:[],attempts:previous.attempts+1};
}
export function labelDifficulty(level: Difficulty):string {
 return level===1?"Guided reasoning":level===2?"Applied judgement":"Expert transfer";
}
export function pickAdaptive<T extends {id:string;level:Difficulty}>(questions:T[],level:Difficulty,seen:string[]):T|undefined {
 const available=questions.filter(q=>!seen.includes(q.id));
 return available.find(q=>q.level===level) || available.find(q=>Math.abs(q.level-level)===1) || available[0];
}
