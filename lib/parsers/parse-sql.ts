import { createTableData } from '@/lib/table/ops';
import type { TableData } from '@/lib/table/types';

function splitSqlList(source: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let quote: "'" | '"' | null = null;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if ((char === "'" || char === '"') && quote === null) {
      quote = char;
      currentValue += char;
      continue;
    }

    if (quote === char) {
      if (nextChar === char) {
        currentValue += char;
        index += 1;
      } else {
        quote = null;
        currentValue += char;
      }
      continue;
    }

    if (char === ',' && quote === null) {
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  values.push(currentValue.trim());
  return values;
}

function unwrapSqlValue(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1).replace(/''/g, "'").replace(/""/g, '"');
  }

  return trimmed;
}

function normalizeRow(values: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => values[index] ?? '');
}

export function parseSql(source: string): TableData {
  const match = source.match(
    /insert\s+into\s+[\w.`"[\]]+\s*\(([\s\S]*?)\)\s*values\s*\(([\s\S]*?)\)\s*;?/i,
  );

  if (!match) {
    return createTableData([], []);
  }

  const columns = splitSqlList(match[1]).map((column) => column.replace(/^[`"[]|[`"\]]$/g, '').trim());
  const values = splitSqlList(match[2]).map(unwrapSqlValue);

  return createTableData(columns, [normalizeRow(values, columns.length)]);
}
