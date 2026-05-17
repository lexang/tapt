import { parseJson } from '@/lib/parsers/parse-json';

describe('parseJson', () => {
  it('把对象数组映射成表格', () => {
    expect(parseJson('[{"name":"Ada","age":36}]')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });

  it('保留异构对象里的新增字段', () => {
    expect(parseJson('[{"name":"Ada"},{"name":"Lin","age":30}]')).toEqual({
      columns: ['name', 'age'],
      rows: [
        [{ value: 'Ada' }, { value: '' }],
        [{ value: 'Lin' }, { value: '30' }],
      ],
    });
  });

  it('嵌套对象与数组用 JSON.stringify 替代 [object Object]', () => {
    expect(parseJson('[{"a":{"x":1},"b":[1,2]}]')).toEqual({
      columns: ['a', 'b'],
      rows: [[{ value: '{"x":1}' }, { value: '[1,2]' }]],
    });
  });
});
