import { generateSql } from '@/lib/generators/generate-sql';

describe('generateSql', () => {
  it('输出 insert 语句', () => {
    expect(
      generateSql({
        columns: ['name', 'age'],
        rows: [[{ value: 'Ada' }, { value: '36' }]],
      }),
    ).toBe("INSERT INTO `data_table` (`name`, `age`) VALUES ('Ada', '36');");
  });
});
