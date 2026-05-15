import { parseCsv } from '@/lib/parsers/parse-csv';

describe('parseCsv', () => {
  it('把首行作为表头', () => {
    expect(parseCsv('name,age\nAda,36')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });

  it('支持带引号的字段', () => {
    expect(parseCsv('name,age\n"Ada, Lovelace",36')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada, Lovelace' }, { value: '36' }]],
    });
  });

  it('忽略空行', () => {
    expect(parseCsv('name,age\n\nAda,36\n\nLin,30')).toEqual({
      columns: ['name', 'age'],
      rows: [
        [{ value: 'Ada' }, { value: '36' }],
        [{ value: 'Lin' }, { value: '30' }],
      ],
    });
  });

  it('按表头列数归一化缺列和多列', () => {
    expect(parseCsv('name,age\nAda\nLin,30,extra')).toEqual({
      columns: ['name', 'age'],
      rows: [
        [{ value: 'Ada' }, { value: '' }],
        [{ value: 'Lin' }, { value: '30' }],
      ],
    });
  });
});
