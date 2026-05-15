import { parseExcel } from '@/lib/parsers/parse-excel';
import { utils, write } from 'xlsx';

describe('parseExcel', () => {
  it('读取工作簿第一张表', () => {
    const sheet = utils.aoa_to_sheet([
      ['name', 'age'],
      ['Ada', 36],
    ]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, sheet, 'Sheet1');
    const buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });

    expect(parseExcel(buffer)).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});
