import { createInitialState, hasTableData, parseSourceText, reducer } from '@/lib/workbench/state';

const initial = createInitialState('csv', 'json');

describe('workbench reducer', () => {
  it('sourceTextChanged 解析有效 CSV 后生成 JSON 输出', () => {
    const next = reducer(initial, {
      type: 'sourceTextChanged',
      value: 'name,age\nAda,36',
    });
    expect(next.table.columns).toEqual(['name', 'age']);
    expect(next.table.rows).toHaveLength(1);
    expect(next.outputText).toContain('"name"');
    expect(next.outputText).toContain('"Ada"');
    expect(next.error).toBeUndefined();
  });

  it('sourceTextChanged 输入合法但 JSON 输入格式下非 JSON 文本会进 error 分支', () => {
    const jsonInitial = createInitialState('json', 'csv');
    const next = reducer(jsonInitial, { type: 'sourceTextChanged', value: 'not-json' });
    expect(next.error).toMatch(/JSON/);
    expect(hasTableData(next.table)).toBe(false);
    expect(next.outputText).toBe('');
  });

  it('inputFormatChanged 在 sourceText 为空但表格已有数据时,保留表格只切输入格式', () => {
    const seeded = reducer(initial, { type: 'sourceTextChanged', value: 'name,age\nAda,36' });
    const stagedNoSource = { ...seeded, sourceText: '' };
    const switched = reducer(stagedNoSource, { type: 'inputFormatChanged', value: 'json' });
    expect(switched.inputFormat).toBe('json');
    expect(switched.table.columns).toEqual(['name', 'age']);
    expect(switched.notice).toContain('JSON');
  });

  it('outputFormatChanged 切到 CSV 时用 CSV 生成器重新输出', () => {
    const withData = reducer(initial, {
      type: 'sourceTextChanged',
      value: 'name,age\nAda,36',
    });
    const switched = reducer(withData, { type: 'outputFormatChanged', value: 'csv' });
    expect(switched.outputFormat).toBe('csv');
    expect(switched.outputText.split('\n')[0]).toBe('name,age');
  });

  it('optionsChanged 改 prettyJson 后重新生成输出', () => {
    const withData = reducer(initial, {
      type: 'sourceTextChanged',
      value: 'name,age\nAda,36',
    });
    const compact = reducer(withData, {
      type: 'optionsChanged',
      value: { prettyJson: false },
    });
    expect(compact.options.prettyJson).toBe(false);
    expect(compact.outputText).not.toContain('\n  "');
  });

  it('parseFailed 保留 sourceName 并清 outputText', () => {
    const next = reducer(initial, {
      type: 'parseFailed',
      message: '解析失败',
      sourceName: 'bad.csv',
    });
    expect(next.error).toBe('解析失败');
    expect(next.sourceName).toBe('bad.csv');
    expect(next.outputText).toBe('');
  });

  it('exampleLoaded 用当前输入格式的内置示例填入', () => {
    const next = reducer(initial, { type: 'exampleLoaded' });
    expect(next.sourceText).toContain('Ada');
    expect(hasTableData(next.table)).toBe(true);
    expect(next.notice).toContain('示例');
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
