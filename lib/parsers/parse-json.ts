import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

function toCellValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseJson(source: string): TableData {
  const parsed = JSON.parse(source) as unknown;

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return createTableData([], []);
  }

  const records = parsed.filter(isRecord);
  if (records.length === 0) {
    return createTableData([], []);
  }

  const columns = records.reduce<string[]>((result, record) => {
    Object.keys(record).forEach((key) => {
      if (!result.includes(key)) {
        result.push(key);
      }
    });
    return result;
  }, []);

  const rows = records.map((record) => {
    return columns.map((column) => toCellValue(record[column]));
  });

  return createTableData(columns, rows);
}
