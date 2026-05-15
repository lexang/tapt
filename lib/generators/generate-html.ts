import type { TableData } from '@/lib/table/types';

export type HtmlGeneratorOptions = {
  includeSectionTags?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateHtml(table: TableData, options: HtmlGeneratorOptions = {}): string {
  const includeSectionTags = options.includeSectionTags ?? true;
  const headerCells = table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('');
  const bodyRows = table.rows
    .map((row) => {
      const cells = table.columns.map((_, index) => `<td>${escapeHtml(row[index]?.value ?? '')}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  if (!includeSectionTags) {
    return `<table><tr>${headerCells}</tr>${bodyRows}</table>`;
  }

  return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}
