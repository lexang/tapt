import type { TableCell, TableData } from '@/lib/table/types';

export function createTableCell(value: string): TableCell {
  return { value };
}

export function createTableRow(values: string[]): TableCell[] {
  return values.map((value) => createTableCell(value));
}

export function createTableData(columns: string[], rows: string[][]): TableData {
  return {
    columns,
    rows: rows.map((row) => createTableRow(row)),
  };
}
