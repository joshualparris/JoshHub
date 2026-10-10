export const REPAIR_CAFE_STORAGE_KEY = "joshhub:repair-cafe-simulator:v1";
export const STATIONS = ["sewing", "computers", "bikes"] as const;
export type SimState = {
  venueId: string;
  venueConfirmed: boolean;
  activeStations: string[];
  assigned: Record<string, string>;
  extraAccepted: string[];
  checks: string[];
  quizAnswers: Record<string, number>;
  incidentIndex: number;
  badChoices: number;
  reflection: string;
};
export const INITIAL_SIM_STATE: SimState = {
  venueId: "",
  venueConfirmed: false,
  activeStations: ["sewing", "computers"],
  assigned: {},
  extraAccepted: [],
  checks: [],
  quizAnswers: {},
  incidentIndex: 0,
  badChoices: 0,
  reflection: "",
};
export type SimData = {
  venues: {id:string;title:string;allowed:string[];accessible:boolean;capacity:number}[];
  volunteers: {id:string;name:string;skills:string[];response:string}[];
  roles: {id:string;label:string}[];
  checks: {id:string}[];
  questions: {id:string;answer:number}[];
  incidents: {id:string;choices:{id:string;correct:boolean;impact:{welcome:number;energy:number;queue:number}}[]}[];
};

export function activeRoles(state: SimState): string[] {
  return ["lead", "welcome", ...STATIONS.filter(x=>state.activeStations.includes(x))];
}
export function canConfirmVolunteer(data: SimData, volunteerId: string): boolean {
  return data.volunteers.some(v=>v.id===volunteerId && v.response==="available");
}
export function canPlaceVolunteer(data: SimData, state: SimState, role: string, volunteerId: string): boolean {
  const person=data.volunteers.find(v=>v.id===volunteerId);
  if (!person || !person.skills.includes(role)) return false;
  if (person.response==="declined" || (person.response!=="accepted" && !state.extraAccepted.includes(person.id))) return false;
  return !Object.entries(state.assigned).some(([otherRole,id])=>otherRole!==role && id===volunteerId);
}
export function readinessBlockers(state:SimState, data:SimData): string[] {
  const issues:string[]=[];
  const venue=data.venues.find(v=>v.id===state.venueId);
  if(!venue) issues.push("Choose a fictional venue.");
  else {
    if(!venue.accessible) issues.push("Venue does not have an accessible circulation route in this scenario.");
    if(!state.venueConfirmed) issues.push("Confirm the fictional venue's written date/activity permission.");
    if(state.activeStations.some(s=>!venue.allowed.includes(s))) issues.push("Your repair categories exceed this venue's permitted scope.");
  }
  if(state.activeStations.length===0) issues.push("Open at least one appropriate repair station.");
  const roles=activeRoles(state);
  if(roles.some(role=>!state.assigned[role])) issues.push("Assign confirmed lead, welcome and every active fixer role.");
  if(new Set(roles.map(role=>state.assigned[role]).filter(Boolean)).size!==roles.map(role=>state.assigned[role]).filter(Boolean).length)
    issues.push("A volunteer cannot cover two simultaneous roster positions.");
  if(roles.some(role=>state.assigned[role] && !canPlaceVolunteer(data,state,role,state.assigned[role])))
    issues.push("A rostered person lacks the skill or accepted shift confirmation.");
  if(data.checks.some(check=>!state.checks.includes(check.id))) issues.push("Finish all four simulated safety and consent gates.");
  if(data.questions.some(q=>state.quizAnswers[q.id]!==q.answer)) issues.push("Pass the three readiness knowledge checks.");
  return issues;
}
export function isSafeResolution(data:SimData, incidentId:string, choiceId:string):boolean {
  return data.incidents.find(event=>event.id===incidentId)?.choices.find(choice=>choice.id===choiceId)?.correct===true;
}
export function dayMetrics(state:SimState,data:SimData) {
  return data.incidents.slice(0,state.incidentIndex).reduce((acc, event)=>{
    const answer=event.choices.find(choice=>choice.correct);
    if(answer) {acc.trust+=answer.impact.welcome;acc.energy+=answer.impact.energy;acc.queue=Math.max(0,acc.queue+answer.impact.queue);}
    return acc;
  },{trust:50,energy:65,queue:2});
}
export function canDebrief(state:SimState,data:SimData):boolean {
  return state.incidentIndex===data.incidents.length && state.reflection.trim().length>=20;
}
export function restoreSim(raw:unknown):SimState {
  if(!raw || typeof raw!=="object") return {...INITIAL_SIM_STATE};
  const v=raw as Partial<SimState>;
  const unique=(x:unknown):string[]=>Array.isArray(x)?Array.from(new Set(x.filter((z):z is string=>typeof z==="string"))):[];
  return {
    venueId: typeof v.venueId==="string"?v.venueId:"",
    venueConfirmed: v.venueConfirmed===true,
    activeStations:unique(v.activeStations),
    assigned: v.assigned&&typeof v.assigned==="object"?v.assigned:{},
    extraAccepted:unique(v.extraAccepted),
    checks:unique(v.checks),
    quizAnswers:v.quizAnswers&&typeof v.quizAnswers==="object"?v.quizAnswers:{},
    incidentIndex: Number.isInteger(v.incidentIndex) && (v.incidentIndex??0)>=0 ? v.incidentIndex! : 0,
    badChoices: Number.isInteger(v.badChoices)&&(v.badChoices??0)>=0 ? v.badChoices! : 0,
    reflection: typeof v.reflection==="string"?v.reflection:"",
  };
}
