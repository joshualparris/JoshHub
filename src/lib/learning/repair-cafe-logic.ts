export const REPAIR_CAFE_STORAGE_KEY = "joshhub:repair-cafe-simulator:v4";
export const STATIONS = ["sewing", "computers", "bikes"] as const;
export type EventDecision = {incidentId:string;choiceId:string;safe:boolean;recovered:boolean;reason:string};
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
  decisions:EventDecision[];
  improvementOwner:string;
  improvementMeasure:string;
  reflection: string;
  debriefPassed:boolean;
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
  decisions:[],
  improvementOwner:"",
  improvementMeasure:"",
  reflection: "",
  debriefPassed:false,
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
export function eventDecision(state:SimState,data:SimData,incidentId:string,choiceId:string,reason:string):SimState {
  const incident=data.incidents[state.incidentIndex];
  if(!incident || incident.id!==incidentId || state.decisions.some(x=>x.incidentId===incidentId))return state;
  const option=incident.choices.find(x=>x.id===choiceId);
  if(!option)return state;
  const decision:EventDecision={incidentId,choiceId,safe:option.correct,recovered:option.correct,reason:reason.trim().slice(0,500)};
  return {...state,decisions:[...state.decisions,decision],badChoices:state.badChoices+(option.correct?0:1),debriefPassed:false};
}
export function recoverDecision(state:SimState,data:SimData):SimState {
  const incident=data.incidents[state.incidentIndex];
  if(!incident)return state;
  const d=state.decisions.find(x=>x.incidentId===incident.id);
  if(!d || d.safe || d.recovered)return state;
  return {...state,decisions:state.decisions.map(x=>x.incidentId===incident.id?{...x,recovered:true}:x)};
}
export function canAdvanceEvent(state:SimState,data:SimData):boolean {
  const incident=data.incidents[state.incidentIndex];
  return Boolean(incident && state.decisions.some(x=>x.incidentId===incident.id && (x.safe||x.recovered)));
}
export function nextEvent(state:SimState,data:SimData):SimState {
  return canAdvanceEvent(state,data)?{...state,incidentIndex:Math.min(data.incidents.length,state.incidentIndex+1)}:state;
}
export function dayMetrics(state:SimState,data:SimData) {
  return state.decisions.reduce((acc,entry)=>{
    const event=data.incidents.find(x=>x.id===entry.incidentId);
    const option=event?.choices.find(x=>x.id===entry.choiceId);
    if(!option)return acc;
    const {welcome,energy,queue}=option.impact;
    acc.trust=Math.max(0,Math.min(100,acc.trust+welcome));
    acc.energy=Math.max(0,Math.min(100,acc.energy+energy));
    acc.queue=Math.max(0,acc.queue+queue);
    if(!entry.safe && entry.recovered){
      // Recovery controls damage but never pretends that an initial unsafe choice was consequence-free.
      acc.trust=Math.min(100,acc.trust+1);
      acc.energy=Math.max(0,acc.energy-1);
      acc.queue+=1;
    }
    return acc;
  },{trust:50,energy:65,queue:2});
}
export function eventPressure(state:SimState,data:SimData):string {
  const metrics=dayMetrics(state,data);
  const earlierUnsafe=state.decisions.filter(d=>!d.safe);
  if(earlierUnsafe.some(d=>d.incidentId==="late") && state.incidentIndex>0 && state.incidentIndex<4)
    return "Earlier, intake coverage wasn't properly controlled. Your recovery has cost time; visitors now need particularly clear expectations about who is being seen.";
  if(earlierUnsafe.some(d=>d.incidentId==="kettle") && state.incidentIndex>2 && state.incidentIndex<6)
    return "The earlier mains-safety error was corrected, but the team must now explain the repair scope again and document the near miss. Do not treat recovery as if nothing happened.";
  if(metrics.queue>=5)
    return "The waiting queue is now congested because of previous choices. Reduce new intake, clarify estimates and protect volunteer capacity rather than chasing a repair-count target.";
  if(metrics.energy<=55)
    return "Volunteer energy is running low. Build in rest, clear handovers and scope limits; adding more work without coverage has consequences.";
  return "The event is still within its fictional operating limits. Keep checking consent, capacity and accessible routes as the situation develops.";
}
export function canDebrief(state:SimState,data:SimData):boolean {
  return state.incidentIndex===data.incidents.length &&
    state.decisions.length===data.incidents.length &&
    state.decisions.every(x=>x.safe||x.recovered) &&
    state.debriefPassed===true &&
    state.reflection.trim().length>0 &&
    state.improvementOwner.trim().length>0 &&
    state.improvementMeasure.trim().length>0;
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
    decisions: Array.isArray(v.decisions)?v.decisions.filter((x):x is EventDecision=>Boolean(x && typeof x==="object" && typeof x.incidentId==="string" && typeof x.choiceId==="string" && typeof x.reason==="string" && typeof x.safe==="boolean" && typeof x.recovered==="boolean")).slice(0,7):[],
    improvementOwner: typeof v.improvementOwner==="string"?v.improvementOwner.slice(0,100):"",
    improvementMeasure: typeof v.improvementMeasure==="string"?v.improvementMeasure.slice(0,300):"",
    reflection: typeof v.reflection==="string"?v.reflection:"",
    debriefPassed: v.debriefPassed===true,
  };
}
