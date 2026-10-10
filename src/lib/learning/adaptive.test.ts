import { describe, expect, it } from "vitest";
import { adapt, initialAdaptiveState, parseAdaptiveState, pickChallenge, type Challenge } from "./adaptive";

describe("adaptive practice", () => {
  it("starts at practitioner and promotes after three correct new answers", () => {
    let s = initialAdaptiveState();
    expect(s.level).toBe(2);
    for (const id of ["a","b","c"]) s=adapt(s,true,id);
    expect(s.level).toBe(3);
    expect(s.recent).toEqual([]);
  });
  it("steps down on two wrong within the last three, never below foundation", () => {
    let s=adapt(initialAdaptiveState(),false,"a");
    s=adapt(s,true,"b");
    s=adapt(s,false,"c");
    expect(s.level).toBe(1);
    for(const id of ["d","e","f"])s=adapt(s,false,id);
    expect(s.level).toBe(1);
  });
  it("does not recycle solved questions or falsely report mastery when exhausted", () => {
    const questions:Challenge[]=[{id:"one",level:2,question:"Test?",options:["A","B","C"],answer:1,explanation:"Why"}];
    expect(pickChallenge(questions,initialAdaptiveState())?.id).toBe("one");
    const done=adapt(initialAdaptiveState(),true,"one");
    expect(pickChallenge(questions,done)).toBeNull();
  });
  it("resets malformed saved state safely", () => {
    expect(parseAdaptiveState('{"level":99}')).toEqual(initialAdaptiveState());
    expect(parseAdaptiveState("{")).toEqual(initialAdaptiveState());
  });
});
