import type { TableData } from '@/lib/table/types';
import { TableGrid } from '@/components/table-editor/table-grid';

type TableEditorProps = {
  table: TableData;
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void;
};

export function TableEditor({ table, onCellChange }: TableEditorProps) {
  return (
    <section aria-labelledby="table-editor-title" style={{ display: 'grid', gap: 12 }}>
      <div>
        <h2 id="table-editor-title" style={{ margin: 0, fontSize: 18 }}>
          表格编辑
        </h2>
        <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 14 }}>
          检查表格内容，修改后结果会自动更新。
        </p>
      </div>
      <TableGrid table={table} onCellChange={onCellChange} />
    </section>
  );
}
