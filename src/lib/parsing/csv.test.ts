import { describe, expect, it } from "vitest";

import { parseCsvRows, parseAuditCsv, CsvParseError, AuditRowSchema } from "./csv";

describe("parseCsvRows", () => {
  it("returns an empty array for empty string or whitespace", () => {
    expect(parseCsvRows("")).toEqual([]);
    expect(parseCsvRows("   \n\n  ")).toEqual([]);
  });

  it("parses unquoted fields and trims trailing newline", () => {
    const csv =
      "name,localPath,repoUrl\nAppA,/path/a,https://github.com/a\nAppB,/path/b,https://github.com/b\n";
    expect(parseCsvRows(csv)).toEqual([
      ["name", "localPath", "repoUrl"],
      ["AppA", "/path/a", "https://github.com/a"],
      ["AppB", "/path/b", "https://github.com/b"],
    ]);
  });

  it("handles CRLF line endings", () => {
    const csv = "a,b\r\n1,2\r\n3,4";
    expect(parseCsvRows(csv)).toEqual([
      ["a", "b"],
      ["1", "2"],
      ["3", "4"],
    ]);
  });

  it("handles quoted fields containing commas", () => {
    const csv =
      'name,description\n"Project, Alpha",First project\n"Beta, Gamma, Delta",Second project';
    expect(parseCsvRows(csv)).toEqual([
      ["name", "description"],
      ["Project, Alpha", "First project"],
      ["Beta, Gamma, Delta", "Second project"],
    ]);
  });

  it("handles escaped quotes per RFC-4180", () => {
    const csv = 'name,note\n"JoshHub ""Pro"" Edition",Special release';
    expect(parseCsvRows(csv)).toEqual([
      ["name", "note"],
      ['JoshHub "Pro" Edition', "Special release"],
    ]);
  });

  it("handles multiline fields containing newlines inside quotes", () => {
    const csv = 'name,bio\nJosh,"Line one\nLine two\nLine three"';
    expect(parseCsvRows(csv)).toEqual([
      ["name", "bio"],
      ["Josh", "Line one\nLine two\nLine three"],
    ]);
  });

  it("throws CsvParseError for unterminated quotes", () => {
    const csv = 'name,status\n"Unterminated project,in-progress';
    expect(() => parseCsvRows(csv)).toThrowError(CsvParseError);
    expect(() => parseCsvRows(csv)).toThrow(/Unterminated quoted field/);
  });
});

describe("AuditRowSchema", () => {
  it("accepts valid rows and preserves extra fields", () => {
    const result = AuditRowSchema.safeParse({
      name: "JoshHub",
      localPath: "/projects/joshhub",
      repoUrl: "https://github.com/joshualparris/JoshHub",
      extraKey: "custom value",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("JoshHub");
      expect((result.data as Record<string, unknown>).extraKey).toBe("custom value");
    }
  });

  it("rejects empty or missing name", () => {
    expect(AuditRowSchema.safeParse({ name: "" }).success).toBe(false);
    expect(AuditRowSchema.safeParse({ name: "   " }).success).toBe(false);
    expect(AuditRowSchema.safeParse({ localPath: "/foo" }).success).toBe(false);
  });
});

describe("parseAuditCsv", () => {
  it("reports error when CSV is empty", () => {
    const result = parseAuditCsv("");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/empty/i);
    expect(result.rows).toHaveLength(0);
  });

  it("reports error when 'name' header is missing", () => {
    const result = parseAuditCsv("title,localPath\nAppA,/path/a");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/missing required 'name' column/i);
    expect(result.rows).toHaveLength(0);
  });

  it("parses valid rows with quoted commas and preserves columns", () => {
    const csv =
      'name,localPath,repoUrl\n"JoshHub, Core",/local/core,https://example.com/repo\nApp2,/local/2,';
    const result = parseAuditCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].name).toBe("JoshHub, Core");
    expect(result.rows[0].localPath).toBe("/local/core");
    expect(result.rows[1].name).toBe("App2");
  });

  it("reports line number and error for rows missing a name", () => {
    const csv = 'name,localPath\nApp1,/path/1\n"",/path/2\nApp3,/path/3';
    const result = parseAuditCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].line).toBe(3);
    expect(result.errors[0].message).toMatch(/Project name is required/i);
  });

  it("catches unterminated quotes and surfaces structured error", () => {
    const csv = 'name,localPath\n"Broken unterminated';
    const result = parseAuditCsv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/Unterminated quoted field/);
  });
});
