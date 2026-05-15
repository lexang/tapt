import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

export function parseCsv(source: string): TableData {
  const normalizedSource = source.trim();
  if (normalizedSource.length === 0) {
    return createTableData([], []);
  }

  const [headerLine = '', ...bodyLines] = normalizedSource.split(/\r?\n/);
  const columns = headerLine.split(',').map((column) => column.trim());
  const rows = bodyLines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(',').map((value) => value.trim()));

  return createTableData(columns, rows);
}
