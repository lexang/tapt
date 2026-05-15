import type { TableData } from '@/lib/table/types';

function escapeCsvValue(value: string): string {
  if (!/[",\r\n]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function formatRow(values: string[]): string {
  return values.map(escapeCsvValue).join(',');
}

export type CsvGeneratorOptions = {
  includeHeader?: boolean;
};

export function generateCsv(table: TableData, options: CsvGeneratorOptions = {}): string {
  const includeHeader = options.includeHeader ?? true;
  const rows = table.rows.map((row) => formatRow(table.columns.map((_, index) => row[index]?.value ?? '')));

  if (!includeHeader) {
    return rows.join('\n');
  }

  return [formatRow(table.columns), ...rows].join('\n');
}
