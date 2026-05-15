import { read, utils } from 'xlsx';
import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

type ExcelSource = ArrayBuffer | Uint8Array;

function toCellValue(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function normalizeRow(values: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => values[index] ?? '');
}

export function parseExcel(source: ExcelSource): TableData {
  const isNodeBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer(source);
  const workbook = read(source, { type: isNodeBuffer ? 'buffer' : 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return createTableData([], []);
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    raw: false,
  });

  if (rows.length === 0) {
    return createTableData([], []);
  }

  const [headerRow, ...bodyRows] = rows;
  const columns = headerRow.map(toCellValue);
  const dataRows = bodyRows.map((row) => normalizeRow(row.map(toCellValue), columns.length));

  return createTableData(columns, dataRows);
}
