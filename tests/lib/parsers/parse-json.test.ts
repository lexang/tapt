import { parseJson } from '@/lib/parsers/parse-json';

describe('parseJson', () => {
  it('把对象数组映射成表格', () => {
    expect(parseJson('[{"name":"Ada","age":36}]')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});
