import { describe, expect, it } from "vitest";

import { extractHashtags, normalizeTag, parseTagList } from "./tagging";

describe("tagging", () => {
  it("normalises a tag into its canonical identifier", () => {
    expect(normalizeTag("  #Family Planning  ")).toBe("family-planning");
  });

  it("parses, normalises and de-duplicates comma separated tags", () => {
    expect(parseTagList(" Work, family, work , #Health, ")).toEqual(["work", "family", "health"]);
  });

  it("extracts unique canonical hashtags", () => {
    expect(extractHashtags("#Family #family #Health-Care")).toEqual(["family", "health-care"]);
  });
});
