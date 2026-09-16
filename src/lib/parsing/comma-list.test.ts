import { describe, expect, it } from "vitest";

import { parseCommaSeparatedList } from "./comma-list";

describe("parseCommaSeparatedList", () => {
  it("trims, removes empty entries and preserves display text", () => {
    expect(parseCommaSeparatedList(" bins, Story time, , water ")).toEqual([
      "bins",
      "Story time",
      "water",
    ]);
  });

  it("removes exact duplicates without changing case", () => {
    expect(parseCommaSeparatedList("Bath, Bath, bath")).toEqual(["Bath", "bath"]);
  });
});
