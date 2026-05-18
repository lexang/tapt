import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const parts: string[] = [];
  let current = '';

  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    const nextChar = trimmed[index + 1];

    if (char === '\\' && (nextChar === '|' || nextChar === '\\')) {
      current += nextChar;
      index += 1;
      continue;
    }

    if (char === '|') {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  parts.push(current.trim());
  return parts;
}

function restoreLineBreaks(value: string): string {
  return value.replace(/<br\s*\/?>/gi, '\n');
}

function isSeparatorRow(values: string[]): boolean {
  return values.length > 0 && values.every((value) => /^:?-{3,}:?$/.test(value.trim()));
}

function normalizeRow(values: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => values[index] ?? '');
}

export function parseMarkdown(source: string): TableData {
  const rows = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes('|'))
    .map(splitMarkdownRow)
    .filter((values) => values.some((value) => value.length > 0));

  if (rows.length === 0) {
    return createTableData([], []);
  }

  const [columns, ...bodyRows] = rows;
  const dataRows = bodyRows
    .filter((values) => !isSeparatorRow(values))
    .map((values) => normalizeRow(values.map(restoreLineBreaks), columns.length));

  return createTableData(columns.map(restoreLineBreaks), dataRows);
}
