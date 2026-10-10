import {describe,it,expect} from "vitest";
import d from "../../data/repair-cafe-simulator.json";
describe("Repair Café curriculum integrity",()=>{
 it("has five distinct stages, three venues and seven contextual incidents",()=>{
   expect(d.reading.map(s=>s.step)).toEqual(["venue","roster","safety","event","debrief"]);
   expect(d.venues).toHaveLength(3);expect(d.incidents).toHaveLength(7);
 });
 it("explains incident outcomes and avoids multiple contradictory safe choices",()=>{
   for(const e of d.incidents){expect(e.choices.filter(c=>c.correct)).toHaveLength(1);expect(e.choices.length).toBeGreaterThanOrEqual(3);expect(e.choices.every(c=>c.why.length>40)).toBe(true);}
 });
 it("prevents unqualified fixes and records narrow real-world legal claims",()=>{
   expect(d.questions[2].why).toContain("SafeWork NSW");
   expect(d.incidents.find(e=>e.id==="kettle")?.choices.find(c=>c.correct)?.id).toBe("stop");
   expect(d.venues.find(v=>v.id==="market")?.accessible).toBe(false);
 });
 it("uses explicit published sources and fake names",()=>{
   expect(d.sources.length).toBeGreaterThanOrEqual(8);
   expect(d.sources.every(s=>/^https:\/\//.test(s.url))).toBe(true);
   expect(d.description).toContain("fictional");
 });
});
