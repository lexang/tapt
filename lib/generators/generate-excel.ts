import { utils, write } from 'xlsx';
import type { TableData } from '@/lib/table/types';

export type ExcelGeneratorOptions = {
  sheetName?: string;
};

export function generateExcel(table: TableData, options: ExcelGeneratorOptions = {}): Uint8Array {
  const rows = [
    table.columns,
    ...table.rows.map((row) => table.columns.map((_, index) => row[index]?.value ?? '')),
  ];
  const sheet = utils.aoa_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, sheet, options.sheetName ?? 'Sheet1');

  const buffer = write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  return new Uint8Array(buffer);
}
