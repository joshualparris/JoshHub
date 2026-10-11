import {describe,it,expect} from "vitest";
import {combineReasoning,assessmentOutcome} from "./assessment-dialogue";
import {writingQuality, gradingDecision,gradingRequest} from "./ai-grading";
describe("Humane Socratic grading",()=>{
 it("does not use a word count to reject Josh's thoughtful but incomplete bicycle idea",()=>{
  expect(writingQuality("Sewing and laptops inside but bicycle repair outside").ok).toBe(true);
  expect(writingQuality("Bike repairs outdoors, if the host and insurance approve.").ok).toBe(true);
 });
 it("keeps punctuation and repeated filler out",()=>{
  expect(writingQuality("....................").ok).toBe(false);
  expect(writingQuality("okay ".repeat(40)).ok).toBe(false);
 });
 it("permits a non-canonical MCQ response to reach AI evaluation",()=>{
  expect(gradingRequest.safeParse({kind:"simulation",simulator:"cafe",challengeId:"cafe:2",selected:2,response:"Sewing and laptops inside but bicycle repair outside"}).success).toBe(true);
  expect(gradingRequest.safeParse({kind:"simulation",simulator:"cafe",challengeId:"cafe:2",selected:null,response:"Bicycles outdoors subject to approval"}).success).toBe(true);
 });
 it("asks a clarification when a promising idea lacks material approval details",()=>{
  const scores={status:"clarify" as const,substantive:true,understanding:3,evidence:3,alternatives:2,risk:1};
  expect(gradingDecision(scores)).toBe("clarify");
  expect(assessmentOutcome({status:"clarify",passed:false,summary:"Good idea; check outside permission.",improvement:"Check cover."},false).finished).toBe(false);
 });
 it("accepts safe, original reasoning without a token threshold",()=>{
  const scores={status:"pass" as const,substantive:true,understanding:3,evidence:3,alternatives:2,risk:2};
  expect(gradingDecision(scores)).toBe("pass");
 });
 it("does not silently award independent mastery after a coached follow-up",()=>{
  const result={status:"pass" as const,passed:true,summary:"Resolved permission.",improvement:"Test it next time."};
  expect(assessmentOutcome(result,true)).toEqual({finished:true,independent:false,awaitingClarification:false});
  expect(assessmentOutcome(result,false).independent).toBe(true);
 });
 it("carries the learner's original idea forward into one focused follow-up",()=>{
  const answer=combineReasoning("Bike repairs outdoors","Only with written site approval, appropriate insurance and safe visitor access.");
  expect(answer).toContain("Bike repairs outdoors");
  expect(answer).toContain("written site approval");
 });
 it("never passes generic or misleading status when the model itself requests revision",()=>{
  expect(gradingDecision({status:"revise",substantive:true,understanding:4,evidence:4,alternatives:4,risk:4})).toBe("revise");
  expect(gradingDecision({status:"pass",substantive:false,understanding:4,evidence:4,alternatives:4,risk:4})).not.toBe("pass");
 });
});
