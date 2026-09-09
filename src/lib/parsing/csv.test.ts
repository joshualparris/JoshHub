import { describe, expect, it } from "vitest";

import { parseCsvRecords } from "./csv";

describe("parseCsvRecords", () => {
  it("preserves commas and escaped quotes inside quoted fields", () => {
    expect(parseCsvRecords('name,notes\n"JoshHub, Main","Says ""hello"""')).toEqual([
      { name: "JoshHub, Main", notes: 'Says "hello"' },
    ]);
  });

  it("preserves newlines inside quoted fields", () => {
    expect(parseCsvRecords('name,notes\nJoshHub,"line one\nline two"')).toEqual([
      { name: "JoshHub", notes: "line one\nline two" },
    ]);
  });

  it("rejects malformed row widths instead of shifting columns silently", () => {
    expect(() => parseCsvRecords("name,repo\nJoshHub")).toThrow(/expected 2/);
  });

  it("rejects unterminated quoted fields", () => {
    expect(() => parseCsvRecords('name,notes\nJoshHub,"broken')).toThrow(/unterminated/);
  });
});
