import { parseMarkdown } from '@/lib/parsers/parse-markdown';

describe('parseMarkdown', () => {
  it('读取 markdown 表格', () => {
    expect(parseMarkdown('| name | age |\n| --- | --- |\n| Ada | 36 |')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });

  it('反转义 \\| 与 \\\\', () => {
    expect(parseMarkdown('| raw |\n| --- |\n| a\\|b\\\\c |')).toEqual({
      columns: ['raw'],
      rows: [[{ value: 'a|b\\c' }]],
    });
  });

  it('<br> 还原为换行', () => {
    expect(parseMarkdown('| note |\n| --- |\n| line1<br>line2 |')).toEqual({
      columns: ['note'],
      rows: [[{ value: 'line1\nline2' }]],
    });
  });
});
