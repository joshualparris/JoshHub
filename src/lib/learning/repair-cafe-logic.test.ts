import {describe,it,expect} from "vitest";
import d from "../../data/repair-cafe-simulator.json";
import {INITIAL_SIM_STATE,activeRoles,canPlaceVolunteer,canConfirmVolunteer,readinessBlockers,isSafeResolution,dayMetrics,canDebrief,restoreSim, type SimState} from "./repair-cafe-logic";
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
   expect(canDebrief({...ready(),incidentIndex:7,reflection:"Next time we will add more time at intake."},data)).toBe(true);
 });
 it("does not mutate metrics and preserves distinct report dimensions",()=>{
    const s={...ready(),incidentIndex:7};
    const m=dayMetrics(s,data);expect(m.trust).toBeGreaterThan(50);expect(m.energy).toBeLessThan(70);expect(m.queue).toBeGreaterThanOrEqual(0);
 });
 it("restores bad storage gracefully",()=>{
    expect(restoreSim("garbage")).toEqual(INITIAL_SIM_STATE);
    expect(restoreSim({incidentIndex:-22,checks:[1,2,"risk","risk"],activeStations:"bogus"}).checks).toEqual(["risk"]);
 });
});
