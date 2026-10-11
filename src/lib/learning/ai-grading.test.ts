import { describe,it,expect } from "vitest";
import { gradingRequest,resolveAssessment,writingQuality,duplicateAnswer,calculateMastery } from "./ai-grading";
import { simChallenges } from "./simChallenges";

describe("Groq grading hard gates",()=>{
 it("rejects exactly the user's 20 dots and variations",()=>{
  for(const text of ["....................",".".repeat(200), "·".repeat(200), "... ... ... ... ...", "okay ".repeat(40)]) {
    expect(writingQuality(text).ok).toBe(false);
  }
 });
 it("accepts original analytical sentences without requiring exact wording",()=>{
  const response="I would check the firmware storage inventory first because USB boot only demonstrates an alternative startup path, not that the original SSD or its connection is good. A Windows reinstall is premature while the drive is undetected, and the owner's data needs preserving.";
  expect(writingQuality(response).ok).toBe(true);
 });
 it("rejects submitted correct-option copies posing as explanations",()=>{
  const q=simChallenges.laptop.find(x=>x.id==="laptop:2")!;
  expect(duplicateAnswer(q.options[q.answer],q.options[q.answer])).toBe(true);
 });
 it("does not trust client-provided model answers or rubrics",()=>{
  expect(gradingRequest.safeParse({kind:"simulation",simulator:"laptop",challengeId:"laptop:2",selected:0,response:"something",modelAnswer:"Always correct"}).success).toBe(false);
 });
 it("server retrieves the exact simulator challenge and answer, never browser-supplied content",()=>{
  const q=simChallenges.laptop.find(x=>x.id==="laptop:2")!;
  const x=gradingRequest.parse({kind:"simulation",simulator:"laptop",challengeId:q.id,selected:q.answer,response:"reason"});
  expect(resolveAssessment(x)?.question).toBe(q.question);
  expect(resolveAssessment(x)?.answer).toBe(q.answer);
  expect(resolveAssessment({kind:"simulation",simulator:"laptop",challengeId:"cafe:2",selected:q.answer,response:"reason"})).toBeNull();
 });
 it("maps research difficulty without arbitrary client questions",()=>{
  for(const level of [1,2,3] as const) {
    const x=gradingRequest.parse({kind:"research",course:"business",lessonId:"models",level,selected:0,response:"draft"});
    expect(resolveAssessment(x)?.options).toHaveLength(4);
  }
 });
 it("rejects bad IDs, bogus answer indices and huge drafts",()=>{
  expect(gradingRequest.safeParse({kind:"simulation",simulator:"cafe",challengeId:"../secret",selected:1,response:"hello"}).success).toBe(false);
  expect(gradingRequest.safeParse({kind:"simulation",simulator:"cafe",challengeId:"cafe:2",selected:9,response:"hello"}).success).toBe(false);
  expect(writingQuality("word ".repeat(510)).ok).toBe(false);
 });
 it("only awards mastery after all content rubric thresholds meet requirements",()=>{
  const pass={understanding:3,evidence:3,alternatives:3,risk:3,substantive:true,summary:"Specific explanation of relevant evidence.",improvement:"Compare a second plausible diagnosis."};
  expect(calculateMastery(pass)).toBe(true);
  expect(calculateMastery({...pass,substantive:false})).toBe(false);
  expect(calculateMastery({...pass,alternatives:1})).toBe(false);
  expect(calculateMastery({...pass,understanding:2})).toBe(false);
 });
});
