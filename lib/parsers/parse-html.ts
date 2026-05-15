import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]*>/g, ''));
}

function extractCells(rowHtml: string): string[] {
  const cells = [...rowHtml.matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)];
  return cells.map((cell) => stripTags(cell[1]));
}

function normalizeRow(values: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => values[index] ?? '');
}

export function parseHtml(source: string): TableData {
  const tableMatch = source.match(/<table\b[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    return createTableData([], []);
  }

  const rows = [...tableMatch[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) => extractCells(row[1]))
    .filter((cells) => cells.length > 0);

  if (rows.length === 0) {
    return createTableData([], []);
  }

  const [columns, ...bodyRows] = rows;
  return createTableData(
    columns,
    bodyRows.map((row) => normalizeRow(row, columns.length)),
  );
}
