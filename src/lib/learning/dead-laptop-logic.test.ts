import { describe, expect, it } from "vitest";
import { canCompleteMission, gradeCase, progressPercentage } from "./dead-laptop-logic";
const c = { id:"demo", family:"backlight", required:["external","flashlight"] };

describe("dead laptop evidence engine", () => {
  it("requires both decisive simulated tests", () => {
    const result = gradeCase(c, ["external"], ["external"], "backlight");
    expect(result.passed).toBe(false);
    expect(result.missing).toEqual(["flashlight"]);
  });
  it("does not accept evidence that was never observed", () => {
    expect(gradeCase(c, ["external","flashlight"], ["external","imaginary"], "backlight").passed).toBe(false);
  });
  it("rejects a guessed fault family despite full observations", () => {
    expect(gradeCase(c, ["external","flashlight"], ["external","flashlight"], "storage").passed).toBe(false);
  });
  it("accepts appropriate observations, chosen evidence, and diagnosis", () => {
    expect(gradeCase(c, ["external","flashlight"], ["external","flashlight"], "backlight").passed).toBe(true);
  });
  it("locks the last mission until all three cases and both checks are correct", () => {
    const a={final:{activity:1,check:1}};
    expect(canCompleteMission("final",a,1,1,{a:true,b:true,c:false},["a","b","c"])).toBe(false);
    expect(canCompleteMission("final",a,1,1,{a:true,b:true,c:true},["a","b","c"])).toBe(true);
  });
  it("does not mark ordinary lessons complete with a wrong answer", () => {
    expect(canCompleteMission("intake",{intake:{activity:1,check:0}},1,1,{},[])).toBe(false);
  });
  it("computes progress without counting duplicate completion IDs", () => {
    expect(progressPercentage(["one","one"],["one","two","three","four"])).toBe(25);
  });
});
