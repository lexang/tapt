import type { TableData } from '@/lib/table/types';

function escapeCsvValue(value: string, delimiter: string): string {
  if (!value.includes('"') && !value.includes(delimiter) && !value.includes('\r') && !value.includes('\n')) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function formatRow(values: string[], delimiter: string): string {
  return values.map((value) => escapeCsvValue(value, delimiter)).join(delimiter);
}

export type CsvGeneratorOptions = {
  includeHeader?: boolean;
  delimiter?: string;
};

export function generateCsv(table: TableData, options: CsvGeneratorOptions = {}): string {
  const includeHeader = options.includeHeader ?? true;
  const delimiter = options.delimiter ?? ',';
  const rows = table.rows.map((row) => formatRow(table.columns.map((_, index) => row[index]?.value ?? ''), delimiter));

  if (!includeHeader) {
    return rows.join('\n');
  }

  return [formatRow(table.columns, delimiter), ...rows].join('\n');
}
