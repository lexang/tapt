import { parseMarkdown } from '@/lib/parsers/parse-markdown';

describe('parseMarkdown', () => {
  it('读取 markdown 表格', () => {
    expect(parseMarkdown('| name | age |\n| --- | --- |\n| Ada | 36 |')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});
