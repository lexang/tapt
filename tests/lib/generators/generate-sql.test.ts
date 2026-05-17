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

  it('multiRowInsert 模式合并为单条 INSERT 多元组', () => {
    expect(
      generateSql(
        {
          columns: ['name', 'age'],
          rows: [
            [{ value: 'Ada' }, { value: '36' }],
            [{ value: 'Lin' }, { value: '30' }],
          ],
        },
        { multiRowInsert: true },
      ),
    ).toBe("INSERT INTO `data_table` (`name`, `age`) VALUES\n  ('Ada', '36'),\n  ('Lin', '30');");
  });

  it('值中的反斜杠、换行与单引号被转义', () => {
    expect(
      generateSql({
        columns: ['raw'],
        rows: [[{ value: "a\\b\nc'd" }]],
      }),
    ).toBe("INSERT INTO `data_table` (`raw`) VALUES ('a\\\\b\\nc''d');");
  });
});

