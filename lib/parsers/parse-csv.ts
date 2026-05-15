import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  values.push(currentValue.trim());
  return values;
}

function normalizeRow(values: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => values[index] ?? '');
}

export function parseCsv(source: string): TableData {
  const normalizedSource = source.trim();
  if (normalizedSource.length === 0) {
    return createTableData([], []);
  }

  const [headerLine = '', ...bodyLines] = normalizedSource.split(/\r?\n/);
  const columns = parseCsvLine(headerLine);
  const rows = bodyLines
    .filter((line) => line.trim().length > 0)
    .map((line) => normalizeRow(parseCsvLine(line), columns.length));

  return createTableData(columns, rows);
}
