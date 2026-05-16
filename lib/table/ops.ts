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

export function normalizeTable(table: TableData): TableData {
  return {
    columns: table.columns,
    rows: table.rows.map((row) =>
      Array.from({ length: table.columns.length }, (_, index) => row[index] ?? createTableCell('')),
    ),
  };
}

export function updateCell(table: TableData, rowIndex: number, columnIndex: number, value: string): TableData {
  return normalizeTable({
    ...table,
    rows: table.rows.map((row, currentRowIndex) => {
      if (currentRowIndex !== rowIndex) {
        return row;
      }

      return table.columns.map((_, currentColumnIndex) => {
        if (currentColumnIndex === columnIndex) {
          return createTableCell(value);
        }

        return row[currentColumnIndex] ?? createTableCell('');
      });
    }),
  });
}

export function updateColumn(table: TableData, columnIndex: number, value: string): TableData {
  return normalizeTable({
    ...table,
    columns: table.columns.map((column, currentColumnIndex) => (currentColumnIndex === columnIndex ? value : column)),
  });
}

export function addRow(table: TableData): TableData {
  if (table.columns.length === 0) {
    return createTableData(['字段1'], [['']]);
  }

  return normalizeTable({
    ...table,
    rows: [...table.rows, createTableRow(table.columns.map(() => ''))],
  });
}

export function deleteRow(table: TableData, rowIndex: number): TableData {
  return normalizeTable({
    ...table,
    rows: table.rows.filter((_, currentRowIndex) => currentRowIndex !== rowIndex),
  });
}

export function addColumn(table: TableData): TableData {
  if (table.columns.length === 0) {
    return createTableData(['字段1'], [['']]);
  }

  return normalizeTable({
    columns: [...table.columns, `字段${table.columns.length + 1}`],
    rows: table.rows.map((row) => [...row, createTableCell('')]),
  });
}

export function deleteColumn(table: TableData, columnIndex: number): TableData {
  return normalizeTable({
    columns: table.columns.filter((_, currentColumnIndex) => currentColumnIndex !== columnIndex),
    rows: table.rows.map((row) => row.filter((_, currentColumnIndex) => currentColumnIndex !== columnIndex)),
  });
}

export function clearTable(): TableData {
  return createTableData([], []);
}
