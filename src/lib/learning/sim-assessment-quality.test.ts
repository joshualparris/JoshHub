import {describe,it,expect} from "vitest";
import {simChallenges} from "./simChallenges";
import {resolveAssessment, gradingRequest} from "./ai-grading";
describe("Adaptive simulation challenge anti-gaming checks",()=>{
 it("covers both modules with unseen, credible options",()=>{
  expect(simChallenges.laptop.length).toBeGreaterThanOrEqual(10);
  expect(simChallenges.cafe.length).toBeGreaterThanOrEqual(9);
  for(const bank of Object.values(simChallenges))for(const q of bank){
   expect(q.options).toHaveLength(3);
   expect(new Set(q.options).size).toBe(3);
   expect(q.options.every(x=>x.length>=64)).toBe(true);
   expect(q.explanation.length).toBeGreaterThan(55);
  }
 });
 it("varies correct-option position rather than a predictable first or middle answer",()=>{
  const all=Object.values(simChallenges).flat();
  const pos=[0,1,2].map(i=>all.filter(q=>q.answer===i).length);
  expect(Math.max(...pos)-Math.min(...pos)).toBeLessThanOrEqual(2);
 });
 it("does not reveal the correct answer through its relative length",()=>{
  const all=Object.values(simChallenges).flat();
  const ranks=[0,1,2].map(rank=>all.filter(q=>q.options.filter(x=>x.length<q.options[q.answer].length).length===rank).length);
  expect(Math.max(...ranks)-Math.min(...ranks)).toBeLessThanOrEqual(3);
 });
 it("server always resolves current answer even when options have moved",()=>{
  for(const kind of ["laptop","cafe"] as const)for(const q of simChallenges[kind]){
   const req=gradingRequest.parse({kind:"simulation",simulator:kind,challengeId:q.id,selected:q.answer,response:"sample"});
   expect(resolveAssessment(req)?.options[q.answer]).toBe(q.options[q.answer]);
  }
 });
});
