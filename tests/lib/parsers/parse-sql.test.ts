import { parseSql } from '@/lib/parsers/parse-sql';

describe('parseSql', () => {
  it('读取简单 INSERT 语句中的值', () => {
    expect(parseSql("INSERT INTO users (name, age) VALUES ('Ada', 36);")).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });

  it('解析多条 INSERT 语句', () => {
    const source = [
      "INSERT INTO `data_table` (`name`, `age`) VALUES ('Ada', '36');",
      "INSERT INTO `data_table` (`name`, `age`) VALUES ('Lin', '30');",
    ].join('\n');

    expect(parseSql(source)).toEqual({
      columns: ['name', 'age'],
      rows: [
        [{ value: 'Ada' }, { value: '36' }],
        [{ value: 'Lin' }, { value: '30' }],
      ],
    });
  });

  it('解析单条 INSERT 中的多行 VALUES', () => {
    const source = "INSERT INTO users (name, age) VALUES ('Ada', 36), ('Lin', 30), ('Grace', 24);";

    expect(parseSql(source)).toEqual({
      columns: ['name', 'age'],
      rows: [
        [{ value: 'Ada' }, { value: '36' }],
        [{ value: 'Lin' }, { value: '30' }],
        [{ value: 'Grace' }, { value: '24' }],
      ],
    });
  });

  it('NULL 关键字映射为空值', () => {
    expect(parseSql("INSERT INTO t (a, b) VALUES ('x', NULL);")).toEqual({
      columns: ['a', 'b'],
      rows: [[{ value: 'x' }, { value: '' }]],
    });
  });

  it('值中包含括号或分号不会破坏分组', () => {
    const source = "INSERT INTO t (note) VALUES ('contains (parens; and semis)');";

    expect(parseSql(source)).toEqual({
      columns: ['note'],
      rows: [[{ value: 'contains (parens; and semis)' }]],
    });
  });

  it('反转义 MySQL 风格的反斜杠序列', () => {
    expect(parseSql("INSERT INTO t (raw) VALUES ('a\\\\b\\nc');")).toEqual({
      columns: ['raw'],
      rows: [[{ value: 'a\\b\nc' }]],
    });
  });
});
