import { z } from "zod";

/**
 * Error thrown when CSV string violates RFC-4180 structure (e.g. unterminated quote).
 */
export class CsvParseError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number
  ) {
    super(`CSV parse error at line ${line}, column ${column}: ${message}`);
    this.name = "CsvParseError";
  }
}

/**
 * RFC-4180 compliant low-level CSV row parser.
 * Supports quoted fields containing commas, escaped quotes (""), and multiline fields.
 */
export function parseCsvRows(text: string): string[][] {
  // Strip UTF-8 BOM if present
  const source = text.startsWith("\uFEFF") ? text.slice(1) : text;
  if (!source.trim()) {
    return [];
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let line = 1;
  let col = 0;
  let quoteStartLine = 1;
  let quoteStartCol = 0;

  let i = 0;
  while (i < source.length) {
    const char = source[i];
    col++;

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < source.length && source[i + 1] === '"') {
          // Escaped quote per RFC-4180 section 2.7
          currentField += '"';
          i += 2;
          col++;
          continue;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        if (char === "\n") {
          line++;
          col = 0;
        }
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        quoteStartLine = line;
        quoteStartCol = col;
        i++;
        continue;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
        i++;
        continue;
      } else if (char === "\r") {
        if (i + 1 < source.length && source[i + 1] === "\n") {
          i++;
        }
        currentRow.push(currentField);
        currentField = "";
        rows.push(currentRow);
        currentRow = [];
        line++;
        col = 0;
        i++;
        continue;
      } else if (char === "\n") {
        currentRow.push(currentField);
        currentField = "";
        rows.push(currentRow);
        currentRow = [];
        line++;
        col = 0;
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  if (inQuotes) {
    throw new CsvParseError("Unterminated quoted field", quoteStartLine, quoteStartCol);
  }

  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  // Strip trailing blank row resulting from a trailing newline
  if (rows.length > 0) {
    const last = rows[rows.length - 1];
    if (last.length === 1 && last[0].trim() === "") {
      rows.pop();
    }
  }

  return rows;
}

/**
 * Strict schema for project inventory audit rows.
 * Enforces non-empty name at the boundary while preserving arbitrary extra columns.
 */
export const AuditRowSchema = z
  .object({
    name: z
      .string({ message: "Project name is required" })
      .trim()
      .min(1, "Project name is required"),
    localPath: z.string().trim().optional(),
    repoUrl: z.string().trim().optional(),
    lastTouched: z.string().trim().optional(),
    status: z.string().trim().optional(),
  })
  .passthrough();

export type AuditRow = z.infer<typeof AuditRowSchema>;

export interface CsvRowError {
  line: number;
  message: string;
}

export interface CsvImportResult<T> {
  rows: T[];
  errors: CsvRowError[];
  headers: string[];
}

/**
 * Validates and parses project audit CSV text into typed AuditRow items.
 * Fails loudly on invalid syntax and reports row-by-row boundary validation errors.
 */
export function parseAuditCsv(text: string): CsvImportResult<AuditRow> {
  let rawRows: string[][];
  try {
    rawRows = parseCsvRows(text);
  } catch (err: unknown) {
    if (err instanceof CsvParseError) {
      return {
        rows: [],
        errors: [{ line: err.line, message: err.message }],
        headers: [],
      };
    }
    return {
      rows: [],
      errors: [{ line: 1, message: err instanceof Error ? err.message : String(err) }],
      headers: [],
    };
  }

  if (rawRows.length === 0) {
    return {
      rows: [],
      errors: [{ line: 1, message: "CSV content is empty" }],
      headers: [],
    };
  }

  const headers = rawRows[0].map((h) => h.trim().replace(/^"|"$/g, ""));
  if (!headers.includes("name")) {
    return {
      rows: [],
      errors: [{ line: 1, message: "CSV header missing required 'name' column" }],
      headers,
    };
  }

  const rows: AuditRow[] = [];
  const errors: CsvRowError[] = [];

  for (let rowIndex = 1; rowIndex < rawRows.length; rowIndex++) {
    const rawValues = rawRows[rowIndex];
    const lineNumber = rowIndex + 1;

    // Skip entirely empty row
    if (rawValues.every((v) => !v.trim())) {
      continue;
    }

    const rowObj: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      if (header) {
        rowObj[header] = rawValues[colIndex]?.trim() ?? "";
      }
    });

    const parsed = AuditRowSchema.safeParse(rowObj);
    if (parsed.success) {
      rows.push(parsed.data);
    } else {
      const issueMessages = parsed.error.issues.map((i) => i.message).join("; ");
      errors.push({
        line: lineNumber,
        message: `Row ${lineNumber}: ${issueMessages}`,
      });
    }
  }

  return { rows, errors, headers };
}
