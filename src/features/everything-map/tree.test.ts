import { describe, expect, it } from "vitest";

import { buildTree, filterTreeByQuery, findNode } from "./tree";
import type { TocItem } from "./types";

const sample: TocItem[] = [
  { id: "7", title: "Daily Life" },
  { id: "7.1", title: "Morning routine" },
  { id: "7.10", title: "Screen habits" },
  { id: "7.2", title: "Evening routine" },
  { id: "8", title: "Tech" },
];

describe("buildTree", () => {
  it("nests children under parents", () => {
    const tree = buildTree(sample);
    const node7 = findNode(tree, "7");
    expect(node7?.children.map((c) => c.id)).toEqual(["7.1", "7.2", "7.10"]);
  });
});

describe("filterTreeByQuery", () => {
  it("keeps ancestors of matches", () => {
    const tree = buildTree(sample);
    const filtered = filterTreeByQuery(tree, "screen");
    expect(findNode(filtered, "7")).toBeTruthy();
    expect(findNode(filtered, "7.10")).toBeTruthy();
    expect(findNode(filtered, "7.1")).toBeNull();
  });
});
