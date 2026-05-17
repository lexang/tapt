import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

const namedEntities: Record<string, string> = {
  nbsp: ' ',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  copy: '©',
  reg: '®',
  trade: '™',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  bull: '•',
  middot: '·',
};

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (full, code) => {
      const codePoint = parseInt(code, 10);
      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
        return full;
      }
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return full;
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (full, code) => {
      const codePoint = parseInt(code, 16);
      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
        return full;
      }
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return full;
      }
    })
    .replace(/&([a-zA-Z][a-zA-Z0-9]+);/g, (full, name) => namedEntities[name.toLowerCase()] ?? full)
    .replace(/&amp;/g, '&');
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]*>/g, '')).trim();
}

type ParsedCell = {
  value: string;
  colspan: number;
  rowspan: number;
};

function readSpanAttr(attrs: string, name: string): number {
  const match = attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']?(\\d+)`, 'i'));
  if (!match) {
    return 1;
  }
  const value = parseInt(match[1], 10);
  return Number.isFinite(value) && value >= 1 ? value : 1;
}

function extractCells(rowHtml: string): ParsedCell[] {
  const cells: ParsedCell[] = [];
  const cellRegex = /<(?:th|td)\b([^>]*)>([\s\S]*?)<\/(?:th|td)>/gi;
  let match: RegExpExecArray | null;
  while ((match = cellRegex.exec(rowHtml)) !== null) {
    cells.push({
      value: stripTags(match[2]),
      colspan: readSpanAttr(match[1], 'colspan'),
      rowspan: readSpanAttr(match[1], 'rowspan'),
    });
  }
  return cells;
}

function buildGrid(rowsCells: ParsedCell[][]): string[][] {
  const grid: string[][] = [];
  const occupied = new Map<string, string>();
  const key = (row: number, column: number) => `${row}:${column}`;

  rowsCells.forEach((cells, rowIndex) => {
    const newRow: string[] = [];
    let columnIndex = 0;
    let cellPointer = 0;

    while (cellPointer < cells.length) {
      while (occupied.has(key(rowIndex, columnIndex))) {
        newRow[columnIndex] = occupied.get(key(rowIndex, columnIndex)) ?? '';
        occupied.delete(key(rowIndex, columnIndex));
        columnIndex += 1;
      }

      const cell = cells[cellPointer];
      newRow[columnIndex] = cell.value;

      for (let dc = 1; dc < cell.colspan; dc += 1) {
        newRow[columnIndex + dc] = cell.value;
      }

      for (let dr = 1; dr < cell.rowspan; dr += 1) {
        for (let dc = 0; dc < cell.colspan; dc += 1) {
          occupied.set(key(rowIndex + dr, columnIndex + dc), cell.value);
        }
      }

      columnIndex += cell.colspan;
      cellPointer += 1;
    }

    while (occupied.has(key(rowIndex, columnIndex))) {
      newRow[columnIndex] = occupied.get(key(rowIndex, columnIndex)) ?? '';
      occupied.delete(key(rowIndex, columnIndex));
      columnIndex += 1;
    }

    grid.push(newRow);
  });

  return grid;
}

function normalizeRow(values: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => values[index] ?? '');
}

export function parseHtml(source: string): TableData {
  const tableMatch = source.match(/<table\b[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    return createTableData([], []);
  }

  const rowsCells = [...tableMatch[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) => extractCells(row[1]))
    .filter((cells) => cells.length > 0);

  if (rowsCells.length === 0) {
    return createTableData([], []);
  }

  const grid = buildGrid(rowsCells);
  if (grid.length === 0) {
    return createTableData([], []);
  }

  const [columns, ...bodyRows] = grid;
  return createTableData(
    columns,
    bodyRows.map((row) => normalizeRow(row, columns.length)),
  );
}
