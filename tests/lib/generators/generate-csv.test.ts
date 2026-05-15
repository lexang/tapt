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
});
