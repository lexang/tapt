import { generateMarkdown } from '@/lib/generators/generate-markdown';

const table = {
  columns: ['name', 'age'],
  rows: [[{ value: 'Ada' }, { value: '36' }]],
};

describe('generateMarkdown', () => {
  it('输出 markdown 表格', () => {
    expect(generateMarkdown(table)).toBe('| name | age |\n| --- | --- |\n| Ada | 36 |');
  });

  it('转义 |、反斜杠,换行转 <br>', () => {
    expect(
      generateMarkdown({
        columns: ['raw'],
        rows: [[{ value: 'a|b\\c\nd' }]],
      }),
    ).toBe('| raw |\n| --- |\n| a\\|b\\\\c<br>d |');
  });
});
