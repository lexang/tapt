import type { TableData } from '@/lib/table/types';

export type JsonGeneratorOptions = {
  pretty?: boolean;
};

export function generateJson(table: TableData, options: JsonGeneratorOptions = {}): string {
  const records = table.rows.map((row) => {
    return table.columns.reduce<Record<string, string>>((record, column, index) => {
      record[column] = row[index]?.value ?? '';
      return record;
    }, {});
  });

  return JSON.stringify(records, null, options.pretty ? 2 : 0);
}
