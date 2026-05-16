import type { TableData } from '@/lib/table/types';

function escapeCsvValue(value: string): string {
  if (!/[",\r\n]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function formatRow(values: string[], delimiter: string): string {
  return values.map(escapeCsvValue).join(delimiter);
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
