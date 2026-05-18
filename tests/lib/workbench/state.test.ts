import {
  createInitialState,
  emptyTable,
  hasTableData,
  parseSourceText,
  reducer,
} from '@/lib/workbench/state';

const initial = createInitialState('csv', 'json');

describe('workbench reducer', () => {
  it('sourceTextChanged 只更新 sourceText,不再同步 parse', () => {
    const next = reducer(initial, {
      type: 'sourceTextChanged',
      value: 'name,age\nAda,36',
    });
    expect(next.sourceText).toBe('name,age\nAda,36');
    expect(next.table).toBe(initial.table);
    expect(next.outputText).toBe('');
    expect(next.error).toBeUndefined();
  });

  it('parsedTableApplied 设 table、生成 outputText、可选 notice', () => {
    const parsed = parseSourceText('name,age\nAda,36', 'csv');
    const next = reducer(initial, {
      type: 'parsedTableApplied',
      table: parsed,
      notice: '已根据输入内容更新结果。',
    });
    expect(next.table.columns).toEqual(['name', 'age']);
    expect(next.outputText).toContain('"Ada"');
    expect(next.notice).toContain('已根据输入内容更新结果');
  });

  it('parsedTableApplied 可同时落 sourceName + sourceText(文件路径用)', () => {
    const parsed = parseSourceText('name,age\nAda,36', 'csv');
    const next = reducer(initial, {
      type: 'parsedTableApplied',
      table: parsed,
      sourceName: 'sample.csv',
      sourceText: 'name,age\nAda,36',
      notice: '已读取 sample.csv。',
    });
    expect(next.sourceName).toBe('sample.csv');
    expect(next.sourceText).toBe('name,age\nAda,36');
  });

  it('parseFailedForSource 清空 table 和 outputText,落 error', () => {
    const seeded = reducer(initial, {
      type: 'parsedTableApplied',
      table: parseSourceText('a,b\n1,2', 'csv'),
    });
    const failed = reducer(seeded, {
      type: 'parseFailedForSource',
      message: '请检查 CSV 数据格式。',
    });
    expect(failed.error).toContain('CSV');
    expect(hasTableData(failed.table)).toBe(false);
    expect(failed.outputText).toBe('');
  });

  it('inputFormatChanged 只 set inputFormat,不重新 parse', () => {
    const seeded = reducer(initial, {
      type: 'parsedTableApplied',
      table: parseSourceText('a,b\n1,2', 'csv'),
    });
    const next = reducer(seeded, { type: 'inputFormatChanged', value: 'json' });
    expect(next.inputFormat).toBe('json');
    expect(next.table).toBe(seeded.table);
    expect(next.outputText).toBe(seeded.outputText);
  });

  it('outputFormatChanged 重新跑 generateText', () => {
    const withData = reducer(initial, {
      type: 'parsedTableApplied',
      table: parseSourceText('name,age\nAda,36', 'csv'),
    });
    const switched = reducer(withData, { type: 'outputFormatChanged', value: 'csv' });
    expect(switched.outputFormat).toBe('csv');
    expect(switched.outputText.split('\n')[0]).toBe('name,age');
  });

  it('optionsChanged 用新选项重新生成 outputText', () => {
    const withData = reducer(initial, {
      type: 'parsedTableApplied',
      table: parseSourceText('name,age\nAda,36', 'csv'),
    });
    const compact = reducer(withData, {
      type: 'optionsChanged',
      value: { prettyJson: false },
    });
    expect(compact.options.prettyJson).toBe(false);
    expect(compact.outputText).not.toContain('\n  "');
  });

  it('parseFailed(文件路径)保留 sourceName 并清 outputText', () => {
    const next = reducer(initial, {
      type: 'parseFailed',
      message: '解析失败',
      sourceName: 'bad.csv',
    });
    expect(next.error).toBe('解析失败');
    expect(next.sourceName).toBe('bad.csv');
    expect(next.outputText).toBe('');
  });

  it('exampleSourceLoaded 把示例文本写入 sourceText,table 由后续 parse 填', () => {
    const next = reducer(initial, {
      type: 'exampleSourceLoaded',
      value: 'name,age\nAda,36',
    });
    expect(next.sourceText).toBe('name,age\nAda,36');
    expect(next.table).toBe(initial.table);
  });

  it('noticeUpdated 单独改 notice 不影响其他字段', () => {
    const next = reducer(initial, { type: 'noticeUpdated', notice: '已切换为 JSON 输入。' });
    expect(next.notice).toContain('JSON');
    expect(next.table).toBe(initial.table);
  });

  it('parsedTableApplied 对 emptyTable 输入会清 outputText', () => {
    const seeded = reducer(initial, {
      type: 'parsedTableApplied',
      table: parseSourceText('a,b\n1,2', 'csv'),
    });
    const cleared = reducer(seeded, { type: 'parsedTableApplied', table: emptyTable });
    expect(hasTableData(cleared.table)).toBe(false);
    expect(cleared.outputText).toBe('');
  });
});

describe('parseSourceText', () => {
  it('空字符串返回空表', () => {
    const result = parseSourceText('', 'csv');
    expect(hasTableData(result)).toBe(false);
  });

  it('按 inputFormat 走对应 parser', () => {
    const result = parseSourceText('[{"a":"1","b":"2"}]', 'json');
    expect(result.columns).toEqual(['a', 'b']);
  });
});
