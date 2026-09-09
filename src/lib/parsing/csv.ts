export type CsvRecord = Record<string, string>;

/**
 * Parse a small RFC-4180-style CSV document without losing quoted commas,
 * escaped quotes, or embedded newlines. Inventory imports are external input,
 * so malformed row widths fail loudly instead of being silently misaligned.
 */
export function parseCsvRecords(source: string): CsvRecord[] {
  const rows = parseCsvRows(source);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());
  if (headers.length === 0 || headers.some((header) => !header)) {
    throw new Error("CSV header row contains an empty column name.");
  }

  return rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim() !== ""))
    .map((row, rowIndex) => {
      if (row.length !== headers.length) {
        throw new Error(
          `CSV row ${rowIndex + 2} has ${row.length} columns; expected ${headers.length}.`
        );
      }

      return Object.fromEntries(headers.map((header, index) => [header, row[index].trim()]));
    });
}

export function parseCsvRows(source: string): string[][] {
  if (!source.trim()) return [];

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && character === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted field.");

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
