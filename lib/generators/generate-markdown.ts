import type { TableData } from '@/lib/table/types';

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function formatRow(values: string[]): string {
  return `| ${values.map(escapeMarkdownCell).join(' | ')} |`;
}

export function generateMarkdown(table: TableData): string {
  const header = formatRow(table.columns);
  const separator = formatRow(table.columns.map(() => '---'));
  const rows = table.rows.map((row) => formatRow(table.columns.map((_, index) => row[index]?.value ?? '')));

  return [header, separator, ...rows].join('\n');
}
