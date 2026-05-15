import { read, utils } from 'xlsx';
import { generateExcel } from '@/lib/generators/generate-excel';

describe('generateExcel', () => {
  it('输出可读取的 Excel 文件', () => {
    const output = generateExcel({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
    const workbook = read(output, { type: 'array' });
    const rows = utils.sheet_to_json<unknown[]>(workbook.Sheets[workbook.SheetNames[0]], {
      header: 1,
      raw: false,
    });

    expect(rows).toEqual([
      ['name', 'age'],
      ['Ada', '36'],
    ]);
  });
});
