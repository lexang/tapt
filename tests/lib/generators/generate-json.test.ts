import { generateJson } from '@/lib/generators/generate-json';

const table = {
  columns: ['name', 'age'],
  rows: [[{ value: 'Ada' }, { value: '36' }]],
};

describe('generateJson', () => {
  it('输出美化 JSON', () => {
    expect(generateJson(table, { pretty: true })).toBe('[\n  {\n    "name": "Ada",\n    "age": "36"\n  }\n]');
  });
});
