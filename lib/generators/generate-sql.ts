import type { TableData } from '@/lib/table/types';

export type SqlGeneratorOptions = {
  tableName?: string;
  includeCreateTable?: boolean;
  multiRowInsert?: boolean;
};

function quoteIdentifier(identifier: string): string {
  return `\`${identifier.replace(/`/g, '``')}\``;
}

function quoteValue(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
  return `'${escaped}'`;
}

export function generateSql(table: TableData, options: SqlGeneratorOptions = {}): string {
  const tableName = options.tableName ?? 'data_table';
  const columns = table.columns.map(quoteIdentifier).join(', ');
  const createTable = `CREATE TABLE ${quoteIdentifier(tableName)} (${table.columns
    .map((column) => `${quoteIdentifier(column)} TEXT`)
    .join(', ')});`;

  const tupleStrings = table.rows.map(
    (row) => `(${table.columns.map((_, index) => quoteValue(row[index]?.value ?? '')).join(', ')})`,
  );

  let inserts = '';
  if (tupleStrings.length > 0) {
    if (options.multiRowInsert) {
      inserts = `INSERT INTO ${quoteIdentifier(tableName)} (${columns}) VALUES\n  ${tupleStrings.join(',\n  ')};`;
    } else {
      inserts = tupleStrings
        .map((tuple) => `INSERT INTO ${quoteIdentifier(tableName)} (${columns}) VALUES ${tuple};`)
        .join('\n');
    }
  }

  if (!options.includeCreateTable) {
    return inserts;
  }

  return [createTable, inserts].filter(Boolean).join('\n');
}

