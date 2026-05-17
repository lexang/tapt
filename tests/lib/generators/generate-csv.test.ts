import { generateCsv } from '@/lib/generators/generate-csv';

describe('generateCsv', () => {
  it('给需要转义的字段加引号', () => {
    expect(
      generateCsv({
        columns: ['name', 'note'],
        rows: [[{ value: 'Ada, Lovelace' }, { value: 'said "hi"' }]],
      }),
    ).toBe('name,note\n"Ada, Lovelace","said ""hi"""');
  });

  it('自定义 delimiter 时字段含该 delimiter 也会加引号', () => {
    expect(
      generateCsv(
        {
          columns: ['key', 'value'],
          rows: [[{ value: 'a;b' }, { value: 'c' }]],
        },
        { delimiter: ';' },
      ),
    ).toBe('key;value\n"a;b";c');
  });
});
