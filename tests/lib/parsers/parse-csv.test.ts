import { parseCsv } from '@/lib/parsers/parse-csv';

describe('parseCsv', () => {
  it('把首行作为表头', () => {
    expect(parseCsv('name,age\nAda,36')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});
