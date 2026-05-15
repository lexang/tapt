import { generateHtml } from '@/lib/generators/generate-html';

describe('generateHtml', () => {
  it('输出带 thead 和 tbody 的表格', () => {
    expect(
      generateHtml({
        columns: ['name', 'age'],
        rows: [[{ value: 'Ada' }, { value: '36' }]],
      }),
    ).toBe('<table><thead><tr><th>name</th><th>age</th></tr></thead><tbody><tr><td>Ada</td><td>36</td></tr></tbody></table>');
  });
});
