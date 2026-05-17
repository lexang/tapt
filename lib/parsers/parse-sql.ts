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

function unescapeMysqlString(input: string): string {
  let result = '';
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === "'" && nextChar === "'") {
      result += "'";
      index += 1;
      continue;
    }

    if (char === '\\' && index + 1 < input.length) {
      switch (nextChar) {
        case '0':
          result += '\0';
          break;
        case 'n':
          result += '\n';
          break;
        case 'r':
          result += '\r';
          break;
        case 't':
          result += '\t';
          break;
        case 'b':
          result += '\b';
          break;
        case 'Z':
          result += '\x1a';
          break;
        case '\\':
          result += '\\';
          break;
        case "'":
          result += "'";
          break;
        case '"':
          result += '"';
          break;
        default:
          result += nextChar;
      }
      index += 1;
      continue;
    }

    result += char;
  }
  return result;
}

function unwrapSqlValue(value: string): string {
  const trimmed = value.trim();
  if (
    trimmed.length >= 2 &&
    trimmed.startsWith("'") &&
    trimmed.endsWith("'")
  ) {
    return unescapeMysqlString(trimmed.slice(1, -1));
  }

  if (
    trimmed.length >= 2 &&
    trimmed.startsWith('"') &&
    trimmed.endsWith('"')
  ) {
    return trimmed.slice(1, -1).replace(/""/g, '"');
  }

  if (trimmed.toLowerCase() === 'null') {
    return '';
  }

  return trimmed;
}

function normalizeRow(values: string[], columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, index) => values[index] ?? '');
}

function findStatementEnd(source: string, start: number): number {
  let depth = 0;
  let quote: "'" | '"' | null = null;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (quote === null) {
      if (char === "'" || char === '"') {
        quote = char;
      } else if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
      } else if (char === ';' && depth === 0) {
        return index;
      }
      continue;
    }

    if (char === quote) {
      if (nextChar === quote) {
        index += 1;
      } else {
        quote = null;
      }
    }
  }

  return source.length;
}

function splitValueTuples(source: string): string[] {
  const tuples: string[] = [];
  let depth = 0;
  let start = -1;
  let quote: "'" | '"' | null = null;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (quote === null) {
      if (char === "'" || char === '"') {
        quote = char;
        continue;
      }
      if (char === '(') {
        if (depth === 0) {
          start = index + 1;
        }
        depth += 1;
        continue;
      }
      if (char === ')') {
        depth -= 1;
        if (depth === 0 && start !== -1) {
          tuples.push(source.slice(start, index));
          start = -1;
        }
        continue;
      }
      continue;
    }

    if (char === quote) {
      if (nextChar === quote) {
        index += 1;
      } else {
        quote = null;
      }
    }
  }

  return tuples;
}

export function parseSql(source: string): TableData {
  const insertPattern = /insert\s+into\s+[\w.`"[\]]+\s*\(([\s\S]*?)\)\s*values\b/gi;

  let columns: string[] = [];
  const rows: string[][] = [];

  let match: RegExpExecArray | null;
  while ((match = insertPattern.exec(source)) !== null) {
    const columnList = match[1];
    const valuesStart = insertPattern.lastIndex;
    const valuesEnd = findStatementEnd(source, valuesStart);

    const currentColumns = splitSqlList(columnList).map((column) =>
      column.replace(/^[`"[]|[`"\]]$/g, '').trim(),
    );

    if (columns.length === 0) {
      columns = currentColumns;
    }

    const tuples = splitValueTuples(source.slice(valuesStart, valuesEnd));
    for (const tuple of tuples) {
      const values = splitSqlList(tuple).map(unwrapSqlValue);
      rows.push(normalizeRow(values, columns.length));
    }

    insertPattern.lastIndex = valuesEnd;
  }

  if (columns.length === 0) {
    return createTableData([], []);
  }

  return createTableData(columns, rows);
}
