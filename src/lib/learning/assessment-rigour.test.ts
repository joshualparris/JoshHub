import { describe, expect, it } from "vitest";
import laptop from "../../data/dead-laptop-detective.json";
import cafe from "../../data/repair-cafe-simulator.json";
import business from "../../data/dubbo-business-field-guide.json";
import tiers from "../../data/field-guide-adaptive-challenges.json";
const all = [
 ...laptop.missions.flatMap(m=>[m.activity,m.check]),
 ...business.lessons.map(l=>l.check),
 ...cafe.questions,
 ...Object.values(tiers.variants).flatMap(v=>[v.guided,v.expert])
];
describe("Learning Lab assessment rigour",()=>{
 it("rejects binary and obviously short multiple-choice assessments",()=>{
  for(const q of all){
    expect(q.options.length).toBe(4);
    expect(q.answer).toBeGreaterThanOrEqual(0);
    expect(q.answer).toBeLessThan(q.options.length);
    expect(new Set(q.options).size).toBe(4);
    for(const option of q.options) expect(option.trim().length).toBeGreaterThan(26);
  }
 });
 it("includes complete adaptive research challenge coverage",()=>{
  expect(business.lessons).toHaveLength(6);
  for(const lesson of business.lessons) expect(tiers.variants).toHaveProperty("business-"+lesson.id);
  for(const id of ["locate","authority","capacity"]) expect(tiers.variants).toHaveProperty("outreach-"+id);
 });
 it("balances correct locations to reduce answer-position cues",()=>{
  const positions=business.lessons.map(l=>l.check.answer);
  expect(new Set(positions).size).toBeGreaterThanOrEqual(3);
  const repairPositions=cafe.incidents.map(e=>e.choices.findIndex(c=>c.correct));
  expect(new Set(repairPositions).size).toBe(3);
  expect(new Set(cafe.questions.map(q=>q.answer)).size).toBe(3);
 });
 it("avoids answer-length shortcuts across the knowledge checks",()=>{
  const lengths=all.map(q=>({best:q.options[q.answer].length,choices:q.options.map(o=>o.length)}));
  const longest=lengths.filter(q=>q.best===Math.max(...q.choices)).length;
  const shortest=lengths.filter(q=>q.best===Math.min(...q.choices)).length;
  expect(longest).toBeLessThanOrEqual(Math.ceil(all.length*0.35));
  expect(shortest).toBeLessThanOrEqual(Math.ceil(all.length*0.35));
 });
 it("keeps unique best-supported outcomes for all seven contextual incidents",()=>{
  expect(cafe.incidents).toHaveLength(7);
  for(const e of cafe.incidents) {
   expect(e.choices.length).toBeGreaterThanOrEqual(3);
   expect(e.choices.filter(c=>c.correct)).toHaveLength(1);
   expect(e.choices.every(c=>c.label.length>75 && c.why.length>60)).toBe(true);
  }
 });
});
