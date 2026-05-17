import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

function stripBom(input: string): string {
  return input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
}

function parseCsvRows(source: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;
  let fieldHadQuotes = false;

  function commitField() {
    row.push(fieldHadQuotes ? current : current.trim());
    current = '';
    fieldHadQuotes = false;
  }

  function commitRow() {
    commitField();
    rows.push(row);
    row = [];
  }

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
        continue;
      }
      current += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      fieldHadQuotes = true;
      continue;
    }

    if (char === ',') {
      commitField();
      continue;
    }

    if (char === '\r' || char === '\n') {
      commitRow();
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    commitRow();
  }

  return rows;
}

function normalizeRow(values: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => values[index] ?? '');
}

export function parseCsv(source: string): TableData {
  const cleaned = stripBom(source);
  if (cleaned.trim().length === 0) {
    return createTableData([], []);
  }

  const rawRows = parseCsvRows(cleaned);
  const nonEmpty = rawRows.filter((row) => row.some((cell) => cell.length > 0));

  if (nonEmpty.length === 0) {
    return createTableData([], []);
  }

  const [header, ...body] = nonEmpty;
  const normalized = body.map((row) => normalizeRow(row, header.length));

  return createTableData(header, normalized);
}
