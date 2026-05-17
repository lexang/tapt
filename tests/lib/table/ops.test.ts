import { deduplicateRows, transposeTable, createTableData } from '@/lib/table/ops';

describe('transposeTable', () => {
  it('行列长度不一时先 normalize 再转置', () => {
    const result = transposeTable({
      columns: ['a', 'b', 'c'],
      rows: [[{ value: '1' }], [{ value: '2' }, { value: '3' }, { value: '4' }]],
    });

    expect(result).toEqual({
      columns: ['a', '1', '2'],
      rows: [
        [{ value: 'b' }, { value: '' }, { value: '3' }],
        [{ value: 'c' }, { value: '' }, { value: '4' }],
      ],
    });
  });

  it('空表保持空', () => {
    expect(transposeTable(createTableData([], []))).toEqual({ columns: [], rows: [] });
  });
});

describe('deduplicateRows', () => {
  it('单元格中含 |~| 不会与其它行误判等价', () => {
    const table = {
      columns: ['a', 'b'],
      rows: [
        [{ value: 'x|~|' }, { value: 'y' }],
        [{ value: 'x' }, { value: '|~|y' }],
      ],
    };

    expect(deduplicateRows(table).rows).toHaveLength(2);
  });

  it('完全相同的行被合并', () => {
    const table = {
      columns: ['a'],
      rows: [[{ value: 'x' }], [{ value: 'x' }], [{ value: 'y' }]],
    };

    expect(deduplicateRows(table).rows).toEqual([[{ value: 'x' }], [{ value: 'y' }]]);
  });
});
