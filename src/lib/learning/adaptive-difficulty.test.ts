import {describe,it,expect} from "vitest";
import {initialAdaptiveRecord,nextAdaptiveRecord,pickAdaptive} from "./adaptive-difficulty";
describe("Adaptive but evidence-oriented difficulty",()=>{
 it("starts at applied reasoning, not trivial recall",()=>expect(initialAdaptiveRecord().level).toBe(2));
 it("raises difficulty after sustained success",()=>{
  let a=initialAdaptiveRecord();a=nextAdaptiveRecord(a,true);expect(a.level).toBe(2);
  a=nextAdaptiveRecord(a,true);expect(a.level).toBe(3);
 });
 it("decreases complexity when learners struggle",()=>{
  let a=initialAdaptiveRecord();a=nextAdaptiveRecord(a,false);a=nextAdaptiveRecord(a,false);expect(a.level).toBe(1);
 });
 it("does not penalise one isolated mistake",()=>{
  let a=initialAdaptiveRecord();a=nextAdaptiveRecord(a,false);a=nextAdaptiveRecord(a,true);expect(a.level).toBe(2);
 });
 it("bounds adaptive levels even after repeated attempts",()=>{
  let a=initialAdaptiveRecord();for(let i=0;i<12;i++)a=nextAdaptiveRecord(a,true);expect(a.level).toBe(3);
  for(let i=0;i<12;i++)a=nextAdaptiveRecord(a,false);expect(a.level).toBe(1);
 });
 it("never repeats an already seen challenge to fill a level",()=>{
  const q=[{id:"a",level:2 as const},{id:"b",level:3 as const}];
  expect(pickAdaptive(q,2,["a"])?.id).toBe("b");
  expect(pickAdaptive(q,2,["a","b"])).toBeUndefined();
 });
});