import type { TableData } from '@/lib/table/types';

type TableGridProps = {
  table: TableData;
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void;
};

export function TableGrid({ table, onCellChange }: TableGridProps) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid #d0d7e2', borderRadius: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th
                key={column}
                scope="col"
                style={{
                  background: '#f4f7fb',
                  borderBottom: '1px solid #d0d7e2',
                  color: '#102033',
                  fontSize: 13,
                  padding: 10,
                  textAlign: 'left',
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {table.columns.map((column, columnIndex) => (
                <td key={`${rowIndex}-${column}`} style={{ borderTop: '1px solid #edf1f6', padding: 6 }}>
                  <div
                    aria-label={`${column} 第 ${rowIndex + 1} 行`}
                    contentEditable
                    role="textbox"
                    suppressContentEditableWarning
                    onInput={(event) => onCellChange(rowIndex, columnIndex, event.currentTarget.textContent ?? '')}
                    style={{
                      width: '100%',
                      minWidth: 120,
                      border: '1px solid transparent',
                      borderRadius: 4,
                      padding: '7px 8px',
                      fontSize: 14,
                    }}
                  >
                    {row[columnIndex]?.value ?? ''}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
