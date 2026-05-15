import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

function parseMarkdownRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((value) => value.trim());
}

function isSeparatorRow(values: string[]): boolean {
  return values.every((value) => /^:?-{3,}:?$/.test(value.trim()));
}

function normalizeRow(values: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => values[index] ?? '');
}

export function parseMarkdown(source: string): TableData {
  const rows = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes('|'))
    .map(parseMarkdownRow)
    .filter((values) => values.some((value) => value.length > 0));

  if (rows.length === 0) {
    return createTableData([], []);
  }

  const [columns, ...bodyRows] = rows;
  const dataRows = bodyRows
    .filter((values) => !isSeparatorRow(values))
    .map((values) => normalizeRow(values, columns.length));

  return createTableData(columns, dataRows);
}
