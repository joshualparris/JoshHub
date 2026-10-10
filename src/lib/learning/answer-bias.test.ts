import { describe, expect, it } from "vitest";
import { simChallenges } from "./simChallenges";

const allQuestions = [...simChallenges.laptop, ...simChallenges.cafe];
const isLongest = (options: readonly string[], answer: number) =>
  options[answer].length === Math.max(...options.map(x => x.length));
const isShortest = (options: readonly string[], answer: number) =>
  options[answer].length === Math.min(...options.map(x => x.length));

describe("learning quiz answer-bias regression", () => {
  it("keeps all 22 authored simulation cases with valid distinct choices", () => {
    expect(allQuestions).toHaveLength(22);
    expect(new Set(allQuestions.map(x => x.id)).size).toBe(allQuestions.length);
    for (const q of allQuestions) {
      expect(q.options).toHaveLength(3);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(3);
      expect(new Set(q.options).size).toBe(3);
      expect(q.explanation.trim().length).toBeGreaterThan(15);
    }
  });
  it("does not leak the answer through option length", () => {
    const longestSuccess = allQuestions.filter(q => isLongest(q.options,q.answer)).length;
    const shortestSuccess = allQuestions.filter(q => isShortest(q.options,q.answer)).length;
    // Random guessing among three answers has an expected success rate of 33%.
    // Allow variation in a small bank; reject shortcuts that dominate.
    expect(longestSuccess / allQuestions.length).toBeLessThanOrEqual(0.45);
    expect(shortestSuccess / allQuestions.length).toBeLessThanOrEqual(0.45);
    for (const q of allQuestions) {
      const lengths=q.options.map(option => option.length);
      expect(Math.max(...lengths) / Math.min(...lengths), q.id).toBeLessThan(1.3);
    }
  });
});
