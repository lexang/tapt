import type { TableData } from '@/lib/table/types';

export type JsonGeneratorOptions = {
  pretty?: boolean;
  shape?: 'array' | 'object';
  rootKey?: string;
};

export function generateJson(table: TableData, options: JsonGeneratorOptions = {}): string {
  const records = table.rows.map((row) => {
    return table.columns.reduce<Record<string, string>>((record, column, index) => {
      record[column] = row[index]?.value ?? '';
      return record;
    }, {});
  });

  const payload = options.shape === 'object' ? { [options.rootKey ?? 'rows']: records } : records;

  return JSON.stringify(payload, null, options.pretty ? 2 : 0);
}
