import { parseHtml } from '@/lib/parsers/parse-html';

describe('parseHtml', () => {
  it('读取第一个 HTML 表格', () => {
    expect(parseHtml('<table><tr><th>name</th><th>age</th></tr><tr><td>Ada</td><td>36</td></tr></table>')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});
