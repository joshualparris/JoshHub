import {describe,it,expect} from "vitest";
import d from "../../data/repair-cafe-simulator.json";
import {INITIAL_SIM_STATE,activeRoles,canPlaceVolunteer,canConfirmVolunteer,readinessBlockers,isSafeResolution,dayMetrics,canDebrief,restoreSim,eventDecision,recoverDecision,canAdvanceEvent,nextEvent,eventPressure,type SimState} from "./repair-cafe-logic";
const data=d;
function ready():SimState {
 return {...INITIAL_SIM_STATE,venueId:"hall",venueConfirmed:true,
   assigned:{lead:"alex",welcome:"morgan",sewing:"maya",computers:"dev"},
   checks:data.checks.map(c=>c.id),
   quizAnswers:Object.fromEntries(data.questions.map(q=>[q.id,q.answer]))};
}
describe("repair cafe operations simulation",()=>{
 it("starts without assuming bookings, people or approvals",()=>expect(readinessBlockers(INITIAL_SIM_STATE,data).length).toBeGreaterThan(2));
 it("opens only after realistic readiness gates",()=>expect(readinessBlockers(ready(),data)).toHaveLength(0));
 it("blocks a provisional venue booking",()=>expect(readinessBlockers({...ready(),venueConfirmed:false},data).join(" ")).toContain("written"));
 it("blocks inaccessible venues and incompatible active repair scopes",()=>expect(readinessBlockers({...ready(),venueId:"market"},data).length).toBeGreaterThan(0));
 it("requires required repair role and welcome",()=>expect(readinessBlockers({...ready(),assigned:{lead:"alex",sewing:"maya",computers:"dev"}} ,data).join(" ")).toContain("Assign"));
 it("does not silently assign interested but unconfirmed people",()=>{
  const s=ready();expect(canConfirmVolunteer(data,"jules")).toBe(true);
  expect(canPlaceVolunteer(data,s,"bikes","jules")).toBe(false);
  expect(canPlaceVolunteer(data,{...s,extraAccepted:["jules"]},"bikes","jules")).toBe(true);
 });
 it("rejects a declined volunteer and double-booking",()=>{
  expect(canPlaceVolunteer(data,ready(),"computers","riley")).toBe(false);
  expect(canPlaceVolunteer(data,ready(),"welcome","alex")).toBe(false);
 });
 it("can reduce repair categories to fit a smaller venue",()=>{
   const s={...ready(),venueId:"library"};
   expect(readinessBlockers(s,data)).toHaveLength(0);
   expect(activeRoles({...s,activeStations:["sewing"]})).toEqual(["lead","welcome","sewing"]);
 });
 it("requires correct quiz answers and safety checks",()=>{
   expect(readinessBlockers({...ready(),quizAnswers:{},checks:[]},data).join(" ")).toContain("knowledge");
 });
 it("accepts only safe handling of mains appliance, passwords and blocked exits",()=>{
  for(const id of ["kettle","laptop","exit"]){
   const incident=data.incidents.find(e=>e.id===id)!;
   expect(incident.choices.filter(c=>c.correct)).toHaveLength(1);
   expect(isSafeResolution(data,id,incident.choices.find(c=>c.correct)!.id)).toBe(true);
   expect(incident.choices.filter(c=>!c.correct).every(c=>!isSafeResolution(data,id,c.id))).toBe(true);
  }
 });
 it("does not award debrief before all seven events and a meaningful reflection",()=>{
   expect(canDebrief({...ready(),incidentIndex:6,reflection:"All went well, I'll keep refining."},data)).toBe(false);
   expect(canDebrief({...ready(),incidentIndex:7,reflection:""},data)).toBe(false);
   expect(canDebrief({...ready(),incidentIndex:7,reflection:"Next time we will add more time at intake."},data)).toBe(false);
   expect(canDebrief({...ready(),incidentIndex:7,reflection:"Next time we will add more time at intake.",debriefPassed:true},data)).toBe(false);
   let s=ready();for(const e of data.incidents){s=eventDecision(s,data,e.id,e.choices.find(c=>c.correct)!.id,"We preserve consent and capacity.");s=nextEvent(s,data);}expect(canDebrief({...s,reflection:"Next month improve intake by training a backup and track waits.",improvementOwner:"Event lead",improvementMeasure:"Log queue waits before and after",debriefPassed:true},data)).toBe(true);
 });
 it("updates actual metrics from actual first decisions, not an idealised answer key",()=>{
    const first=data.incidents[0];
    const good=eventDecision(ready(),data,first.id,first.choices.find(c=>c.correct)!.id,"We hold intake because safe queues matter.");
    const bad=eventDecision(ready(),data,first.id,first.choices.find(c=>!c.correct)!.id,"We assumed an informal queue might work.");
    expect(dayMetrics(good,data)).not.toEqual(dayMetrics(bad,data));
    expect(good.badChoices).toBe(0);
    expect(bad.badChoices).toBe(1);
    expect(canAdvanceEvent(bad,data)).toBe(false);
    expect(nextEvent(bad,data).incidentIndex).toBe(0);
    expect(eventPressure(nextEvent(good,data),data)).not.toContain("wasn't properly controlled");
 });
 it("does not erase an unsafe first choice when a learner recovers",()=>{
    const first=data.incidents[0];
    const wrong=eventDecision(ready(),data,first.id,first.choices.find(c=>!c.correct)!.id,"Intake was rushed.");
    const recovered=recoverDecision(wrong,data);
    expect(recovered.decisions[0].safe).toBe(false);
    expect(recovered.decisions[0].recovered).toBe(true);
    expect(recovered.badChoices).toBe(1);
    expect(canAdvanceEvent(recovered,data)).toBe(true);
    expect(eventPressure(nextEvent(recovered,data),data)).toContain("intake coverage");
    expect(dayMetrics(recovered,data)).not.toEqual(dayMetrics(ready(),data));
 });
 it("cannot register multiple first answers to the same event",()=>{
    const e=data.incidents[0];
    const chosen=eventDecision(ready(),data,e.id,e.choices[0].id,"reason");
    expect(eventDecision(chosen,data,e.id,e.choices[1].id,"new guess")).toEqual(chosen);
 });
 it("does not allow impossible event order or forged options",()=>{
    const s=ready();
    expect(eventDecision(s,data,data.incidents[1].id,data.incidents[1].choices[0].id,"x")).toEqual(s);
    expect(eventDecision(s,data,data.incidents[0].id,"forged","x")).toEqual(s);
 });
 it("restores bad storage gracefully",()=>{
    expect(restoreSim("garbage")).toEqual(INITIAL_SIM_STATE);
    expect(restoreSim({incidentIndex:-22,checks:[1,2,"risk","risk"],activeStations:"bogus"}).checks).toEqual(["risk"]);
 });
});
