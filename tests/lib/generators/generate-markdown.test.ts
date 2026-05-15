import { generateMarkdown } from '@/lib/generators/generate-markdown';

const table = {
  columns: ['name', 'age'],
  rows: [[{ value: 'Ada' }, { value: '36' }]],
};

describe('generateMarkdown', () => {
  it('输出 markdown 表格', () => {
    expect(generateMarkdown(table)).toBe('| name | age |\n| --- | --- |\n| Ada | 36 |');
  });
});
