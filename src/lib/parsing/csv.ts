import { z } from "zod";

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

type CsvParserState = "field-start" | "unquoted" | "quoted" | "after-quote";

interface ParsedCsvRecord {
  fields: string[];
  startLine: number;
}

// JoshHub has no CSV dependency and this screen only needs local preview import.
// Keep the supported quoting rules explicit and reject ambiguous syntax rather
// than silently coercing malformed rows into confident match results.
function parseCsvRecords(text: string): ParsedCsvRecord[] {
  const source = text.startsWith("\uFEFF") ? text.slice(1) : text;
  if (source.length === 0) return [];

  const records: ParsedCsvRecord[] = [];
  let currentFields: string[] = [];
  let currentField = "";
  let state: CsvParserState = "field-start";
  let sourceIndex = 0;
  let line = 1;
  let column = 1;
  let recordStartLine = 1;
  let quotedFieldStartLine = 1;
  let quotedFieldStartColumn = 1;

  const finishField = () => {
    currentFields.push(currentField);
    currentField = "";
    state = "field-start";
  };

  const finishRecord = () => {
    finishField();
    records.push({ fields: currentFields, startLine: recordStartLine });
    currentFields = [];
  };

  const consumeRecordBreak = () => {
    if (source[sourceIndex] === "\r" && source[sourceIndex + 1] === "\n") {
      sourceIndex += 2;
    } else {
      sourceIndex += 1;
    }
    line += 1;
    column = 1;
    finishRecord();
    recordStartLine = line;
  };

  while (sourceIndex < source.length) {
    const character = source[sourceIndex];

    if (state === "quoted") {
      if (character === '"') {
        state = "after-quote";
        sourceIndex += 1;
        column += 1;
        continue;
      }

      if (character === "\r") {
        if (source[sourceIndex + 1] === "\n") {
          currentField += "\r\n";
          sourceIndex += 2;
        } else {
          currentField += "\r";
          sourceIndex += 1;
        }
        line += 1;
        column = 1;
        continue;
      }

      if (character === "\n") {
        currentField += "\n";
        sourceIndex += 1;
        line += 1;
        column = 1;
        continue;
      }

      currentField += character;
      sourceIndex += 1;
      column += 1;
      continue;
    }

    if (state === "after-quote") {
      if (character === '"') {
        currentField += '"';
        state = "quoted";
        sourceIndex += 1;
        column += 1;
        continue;
      }

      if (character === ",") {
        finishField();
        sourceIndex += 1;
        column += 1;
        continue;
      }

      if (character === "\r" || character === "\n") {
        consumeRecordBreak();
        continue;
      }

      throw new CsvParseError("Unexpected character after closing quote", line, column);
    }

    if (state === "field-start") {
      if (character === '"') {
        state = "quoted";
        quotedFieldStartLine = line;
        quotedFieldStartColumn = column;
        sourceIndex += 1;
        column += 1;
        continue;
      }

      if (character === ",") {
        finishField();
        sourceIndex += 1;
        column += 1;
        continue;
      }

      if (character === "\r" || character === "\n") {
        consumeRecordBreak();
        continue;
      }

      currentField += character;
      state = "unquoted";
      sourceIndex += 1;
      column += 1;
      continue;
    }

    if (character === '"') {
      throw new CsvParseError("Quote character must begin a quoted field", line, column);
    }

    if (character === ",") {
      finishField();
      sourceIndex += 1;
      column += 1;
      continue;
    }

    if (character === "\r" || character === "\n") {
      consumeRecordBreak();
      continue;
    }

    currentField += character;
    sourceIndex += 1;
    column += 1;
  }

  if (state === "quoted") {
    throw new CsvParseError(
      "Unterminated quoted field",
      quotedFieldStartLine,
      quotedFieldStartColumn
    );
  }

  if (state === "after-quote" || state === "unquoted" || currentFields.length > 0) {
    finishField();
    records.push({ fields: currentFields, startLine: recordStartLine });
  }

  return records;
}

export function parseCsvRows(text: string): string[][] {
  return parseCsvRecords(text).map((record) => record.fields);
}

export const AuditRowSchema = z
  .object({
    name: z.string({ message: "Project name is required" }).trim().min(1, "Project name is required"),
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

function duplicateHeaderNames(headers: string[]): string[] {
  const seenHeaders = new Set<string>();
  const duplicateHeaders = new Set<string>();

  for (const header of headers) {
    if (seenHeaders.has(header)) duplicateHeaders.add(header);
    seenHeaders.add(header);
  }

  return [...duplicateHeaders];
}

export function parseAuditCsv(text: string): CsvImportResult<AuditRow> {
  let parsedRecords: ParsedCsvRecord[];
  try {
    parsedRecords = parseCsvRecords(text);
  } catch (error: unknown) {
    if (error instanceof CsvParseError) {
      return {
        rows: [],
        errors: [{ line: error.line, message: error.message }],
        headers: [],
      };
    }
    throw error;
  }

  if (parsedRecords.length === 0) {
    return {
      rows: [],
      errors: [{ line: 1, message: "CSV content is empty" }],
      headers: [],
    };
  }

  const headerRecord = parsedRecords[0];
  const headers = headerRecord.fields.map((header) => header.trim());

  if (headers.some((header) => header.length === 0)) {
    return {
      rows: [],
      errors: [{ line: headerRecord.startLine, message: "CSV headers must not be blank" }],
      headers,
    };
  }

  const duplicateHeaders = duplicateHeaderNames(headers);
  if (duplicateHeaders.length > 0) {
    return {
      rows: [],
      errors: [
        {
          line: headerRecord.startLine,
          message: `CSV headers must be unique; duplicate: ${duplicateHeaders.join(", ")}`,
        },
      ],
      headers,
    };
  }

  if (!headers.includes("name")) {
    return {
      rows: [],
      errors: [{ line: headerRecord.startLine, message: "CSV header missing required 'name' column" }],
      headers,
    };
  }

  const rows: AuditRow[] = [];
  const errors: CsvRowError[] = [];

  for (const record of parsedRecords.slice(1)) {
    if (record.fields.every((value) => !value.trim())) continue;

    if (record.fields.length !== headers.length) {
      errors.push({
        line: record.startLine,
        message: `Row starting at line ${record.startLine}: expected ${headers.length} columns but found ${record.fields.length}`,
      });
      continue;
    }

    const rowObject: Record<string, string> = {};
    headers.forEach((header, columnIndex) => {
      rowObject[header] = record.fields[columnIndex];
    });

    const parsedRow = AuditRowSchema.safeParse(rowObject);
    if (parsedRow.success) {
      rows.push(parsedRow.data);
      continue;
    }

    const issueMessages = parsedRow.error.issues.map((issue) => issue.message).join("; ");
    errors.push({
      line: record.startLine,
      message: `Row starting at line ${record.startLine}: ${issueMessages}`,
    });
  }

  return { rows, errors, headers };
}
