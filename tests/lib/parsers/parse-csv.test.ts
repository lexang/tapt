import { parseCsv } from '@/lib/parsers/parse-csv';

describe('parseCsv', () => {
  it('把首行作为表头', () => {
    expect(parseCsv('name,age\nAda,36')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });

  it('支持带引号的字段', () => {
    expect(parseCsv('name,age\n"Ada, Lovelace",36')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada, Lovelace' }, { value: '36' }]],
    });
  });

  it('忽略空行', () => {
    expect(parseCsv('name,age\n\nAda,36\n\nLin,30')).toEqual({
      columns: ['name', 'age'],
      rows: [
        [{ value: 'Ada' }, { value: '36' }],
        [{ value: 'Lin' }, { value: '30' }],
      ],
    });
  });

  it('按表头列数归一化缺列和多列', () => {
    expect(parseCsv('name,age\nAda\nLin,30,extra')).toEqual({
      columns: ['name', 'age'],
      rows: [
        [{ value: 'Ada' }, { value: '' }],
        [{ value: 'Lin' }, { value: '30' }],
      ],
    });
  });

  it('保留引号内部的前后空格', () => {
    expect(parseCsv('a,b\n"  spaced  ",x')).toEqual({
      columns: ['a', 'b'],
      rows: [[{ value: '  spaced  ' }, { value: 'x' }]],
    });
  });

  it('支持引号内换行', () => {
    expect(parseCsv('a,b\n"line1\nline2",x')).toEqual({
      columns: ['a', 'b'],
      rows: [[{ value: 'line1\nline2' }, { value: 'x' }]],
    });
  });

  it('剥离 UTF-8 BOM', () => {
    expect(parseCsv('﻿name,age\nAda,36')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });

  it('支持 CRLF 与 CR 行结束符', () => {
    expect(parseCsv('name,age\r\nAda,36\rLin,30')).toEqual({
      columns: ['name', 'age'],
      rows: [
        [{ value: 'Ada' }, { value: '36' }],
        [{ value: 'Lin' }, { value: '30' }],
      ],
    });
  });

  it('支持双引号转义', () => {
    expect(parseCsv('quote\n"He said ""hi""."')).toEqual({
      columns: ['quote'],
      rows: [[{ value: 'He said "hi".' }]],
    });
  });
});

