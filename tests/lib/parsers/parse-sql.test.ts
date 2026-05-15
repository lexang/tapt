import { parseSql } from '@/lib/parsers/parse-sql';

describe('parseSql', () => {
  it('读取简单 INSERT 语句中的值', () => {
    expect(parseSql("INSERT INTO users (name, age) VALUES ('Ada', 36);")).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});
