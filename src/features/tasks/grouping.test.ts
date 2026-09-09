import { describe, expect, it } from "vitest";

import type { Task } from "@/lib/db/schema";
import { groupTasksByDue } from "./grouping";

function task(id: string, dueDate: string | null, updatedAt = 1): Task {
  return {
    id,
    title: id,
    status: "open",
    priority: "med",
    dueDate,
    tags: [],
    createdAt: 1,
    updatedAt,
  };
}

describe("groupTasksByDue", () => {
  it("groups tasks at the local-date boundary without mutating the input", () => {
    const input = [
      task("someday", null, 10),
      task("later", "2026-09-11"),
      task("today", "2026-09-09"),
    ];
    const original = [...input];

    const groups = groupTasksByDue(input, "2026-09-09");

    expect(groups.today.map((item) => item.id)).toEqual(["today"]);
    expect(groups.upcoming.map((item) => item.id)).toEqual(["later"]);
    expect(groups.someday.map((item) => item.id)).toEqual(["someday"]);
    expect(input).toEqual(original);
  });

  it("orders undated tasks by most recent update", () => {
    const groups = groupTasksByDue([task("older", null, 2), task("newer", null, 9)], "2026-09-09");

    expect(groups.someday.map((item) => item.id)).toEqual(["newer", "older"]);
  });
});
