import type { TableData } from '@/lib/table/types';
import { Button } from '@/components/ui/button';

type TableGridProps = {
  table: TableData;
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void;
  onColumnChange: (columnIndex: number, value: string) => void;
  onDeleteColumn: (columnIndex: number) => void;
  onDeleteRow: (rowIndex: number) => void;
};

export function TableGrid({
  table,
  onCellChange,
  onColumnChange,
  onDeleteColumn,
  onDeleteRow,
}: TableGridProps) {
  if (table.columns.length === 0) {
    return (
      <div className="empty-table">
        <strong>还没有可预览的表格</strong>
        <span>粘贴数据、上传文件或使用示例后，可以在这里检查和修改内容。</span>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-grid">
        <thead>
          <tr>
            <th className="row-index" scope="col">
              #
            </th>
            {table.columns.map((column, columnIndex) => (
              <th key={`${columnIndex}-${column}`} scope="col">
                <div className="column-head">
                  <input
                    aria-label={`第 ${columnIndex + 1} 列名称`}
                    autoComplete="off"
                    name={`column-${columnIndex}`}
                    onChange={(event) => onColumnChange(columnIndex, event.target.value)}
                    value={column}
                  />
                  <Button
                    aria-label={`删除 ${column || `第 ${columnIndex + 1} 列`}`}
                    onClick={() => onDeleteColumn(columnIndex)}
                    size="sm"
                    variant="ghost"
                  >
                    删除
                  </Button>
                </div>
              </th>
            ))}
            <th className="action-cell" scope="col">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th className="row-index" scope="row">
                {rowIndex + 1}
              </th>
              {table.columns.map((column, columnIndex) => (
                <td key={`${rowIndex}-${columnIndex}`}>
                  <input
                    aria-label={`${column || `第 ${columnIndex + 1} 列`} 第 ${rowIndex + 1} 行`}
                    autoComplete="off"
                    name={`cell-${rowIndex}-${columnIndex}`}
                    onChange={(event) => onCellChange(rowIndex, columnIndex, event.target.value)}
                    value={row[columnIndex]?.value ?? ''}
                  />
                </td>
              ))}
              <td className="action-cell">
                <Button
                  aria-label={`删除第 ${rowIndex + 1} 行`}
                  onClick={() => onDeleteRow(rowIndex)}
                  size="sm"
                  variant="ghost"
                >
                  删除
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
