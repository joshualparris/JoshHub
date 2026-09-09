import { describe, expect, it } from "vitest";

import { parseCsvRows, parseAuditCsv, CsvParseError, AuditRowSchema } from "./csv";

describe("parseCsvRows", () => {
  it("returns an empty array for an empty string", () => {
    expect(parseCsvRows("")).toEqual([]);
  });

  it("parses unquoted fields and a trailing newline", () => {
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

  it("handles a UTF-8 BOM", () => {
    expect(parseCsvRows("\uFEFFname,status\nJoshHub,active")).toEqual([
      ["name", "status"],
      ["JoshHub", "active"],
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

  it("handles escaped quotes", () => {
    const csv = 'name,note\n"JoshHub ""Pro"" Edition",Special release';
    expect(parseCsvRows(csv)).toEqual([
      ["name", "note"],
      ["JoshHub \"Pro\" Edition", "Special release"],
    ]);
  });

  it("handles multiline quoted fields", () => {
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

  it("rejects a quote that begins in the middle of an unquoted field", () => {
    expect(() => parseCsvRows('name,note\nPro"ject,broken')).toThrow(
      /Quote character must begin a quoted field/
    );
  });

  it("rejects characters after a closing quote before the delimiter", () => {
    expect(() => parseCsvRows('name,note\n"Project"x,broken')).toThrow(
      /Unexpected character after closing quote/
    );
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
  it("reports an error when CSV is empty", () => {
    const result = parseAuditCsv("");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/empty/i);
    expect(result.rows).toHaveLength(0);
  });

  it("reports an error when the name header is missing", () => {
    const result = parseAuditCsv("title,localPath\nAppA,/path/a");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/missing required 'name' column/i);
    expect(result.rows).toHaveLength(0);
  });

  it("rejects blank headers", () => {
    const result = parseAuditCsv("name,,status\nAppA,ignored,active");
    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].message).toMatch(/headers must not be blank/i);
  });

  it("rejects duplicate headers rather than overwriting one value", () => {
    const result = parseAuditCsv("name,status,status\nAppA,active,other");
    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].message).toMatch(/headers must be unique/i);
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

  it("reports the physical source line after an earlier multiline record", () => {
    const csv = 'name,note\nAlpha,"line one\nline two"\n"",missing name';
    const result = parseAuditCsv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].line).toBe(4);
    expect(result.errors[0].message).toMatch(/line 4/i);
  });

  it("rejects rows with a different column count from the header", () => {
    const tooFew = parseAuditCsv("name,status,repoUrl\nAppA,active");
    expect(tooFew.rows).toHaveLength(0);
    expect(tooFew.errors[0].message).toMatch(/expected 3 columns but found 2/i);

    const tooMany = parseAuditCsv("name,status\nAppA,active,unexpected");
    expect(tooMany.rows).toHaveLength(0);
    expect(tooMany.errors[0].message).toMatch(/expected 2 columns but found 3/i);
  });

  it("preserves whitespace in arbitrary metadata columns", () => {
    const result = parseAuditCsv('name,custom\n AppA ,"  keep me  "');
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].name).toBe("AppA");
    expect((result.rows[0] as Record<string, unknown>).custom).toBe("  keep me  ");
  });

  it("surfaces malformed quote syntax as a structured file error", () => {
    const result = parseAuditCsv('name,localPath\n"Broken"x,/tmp');
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/Unexpected character after closing quote/);
  });
});
