import { parseHtml } from '@/lib/parsers/parse-html';

describe('parseHtml', () => {
  it('读取第一个 HTML 表格', () => {
    expect(parseHtml('<table><tr><th>name</th><th>age</th></tr><tr><td>Ada</td><td>36</td></tr></table>')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });

  it('解码数字与命名实体', () => {
    expect(
      parseHtml('<table><tr><th>sign</th></tr><tr><td>&#65; &#x42; &copy; &mdash;</td></tr></table>'),
    ).toEqual({
      columns: ['sign'],
      rows: [[{ value: 'A B © —' }]],
    });
  });

  it('展开 colspan 填充重复值', () => {
    expect(
      parseHtml(
        '<table><tr><th colspan="2">group</th><th>note</th></tr><tr><td>a</td><td>b</td><td>c</td></tr></table>',
      ),
    ).toEqual({
      columns: ['group', 'group', 'note'],
      rows: [[{ value: 'a' }, { value: 'b' }, { value: 'c' }]],
    });
  });

  it('展开 rowspan 在后续行填值', () => {
    expect(
      parseHtml(
        '<table><tr><th>k</th><th>v</th></tr><tr><td rowspan="2">x</td><td>1</td></tr><tr><td>2</td></tr></table>',
      ),
    ).toEqual({
      columns: ['k', 'v'],
      rows: [
        [{ value: 'x' }, { value: '1' }],
        [{ value: 'x' }, { value: '2' }],
      ],
    });
  });
});

