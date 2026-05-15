import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

function toCellValue(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

export function parseJson(source: string): TableData {
  const parsed = JSON.parse(source) as unknown;

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return createTableData([], []);
  }

  const firstRow = parsed[0];
  if (firstRow === null || typeof firstRow !== 'object' || Array.isArray(firstRow)) {
    return createTableData([], []);
  }

  const columns = Object.keys(firstRow as Record<string, unknown>);
  const rows = parsed.map((item) => {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      return columns.map(() => '');
    }

    const record = item as Record<string, unknown>;
    return columns.map((column) => toCellValue(record[column]));
  });

  return createTableData(columns, rows);
}
