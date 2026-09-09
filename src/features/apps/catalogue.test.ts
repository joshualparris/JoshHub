import { describe, expect, it } from "vitest";

import type { CatalogItem } from "@/data/apps";

import { filterAndRankApps, statusFilterFromQuery } from "./catalogue";

function app(id: string, status: CatalogItem["status"], name = id): CatalogItem {
  return {
    id,
    name,
    type: "app",
    category: "Test",
    status,
    tags: [],
    primaryUrl: `https://example.com/${id}`,
    urls: [],
  };
}

describe("statusFilterFromQuery", () => {
  it("accepts every canonical status and rejects arbitrary URL values", () => {
    expect(statusFilterFromQuery("maintained")).toBe("maintained");
    expect(statusFilterFromQuery("definitely-not-a-status")).toBe("all");
    expect(statusFilterFromQuery(undefined)).toBe("all");
  });
});

describe("filterAndRankApps", () => {
  it("puts pinned apps first, then canonical status priority, then name", () => {
    const result = filterAndRankApps(
      [app("broken-b", "broken", "B"), app("active-z", "active", "Z"), app("ok-a", "ok", "A")],
      { search: "", status: "all", category: "all", pinnedIds: ["broken-b"] }
    );

    expect(result.map((entry) => entry.id)).toEqual(["broken-b", "active-z", "ok-a"]);
  });

  it("filters against one searchable catalogue representation", () => {
    const tagged = { ...app("tagged", "ok"), tags: ["finance"], notes: "monthly plan" };
    expect(
      filterAndRankApps([tagged, app("other", "ok")], {
        search: "monthly",
        status: "all",
        category: "all",
        pinnedIds: [],
      }).map((entry) => entry.id)
    ).toEqual(["tagged"]);
  });
});
