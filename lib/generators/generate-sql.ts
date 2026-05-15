import type { TableData } from '@/lib/table/types';

export type SqlGeneratorOptions = {
  tableName?: string;
};

function quoteIdentifier(identifier: string): string {
  return `\`${identifier.replace(/`/g, '``')}\``;
}

function quoteValue(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function generateSql(table: TableData, options: SqlGeneratorOptions = {}): string {
  const tableName = options.tableName ?? 'data_table';
  const columns = table.columns.map(quoteIdentifier).join(', ');

  return table.rows
    .map((row) => {
      const values = table.columns.map((_, index) => quoteValue(row[index]?.value ?? '')).join(', ');
      return `INSERT INTO ${quoteIdentifier(tableName)} (${columns}) VALUES (${values});`;
    })
    .join('\n');
}
