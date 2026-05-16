import type { TableData } from '@/lib/table/types';
import { TableGrid } from '@/components/table-editor/table-grid';
import { Button } from '@/components/ui/button';

type TableEditorProps = {
  canEdit: boolean;
  table: TableData;
  onAddColumn: () => void;
  onAddRow: () => void;
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void;
  onClearTable: () => void;
  onColumnChange: (columnIndex: number, value: string) => void;
  onDeleteColumn: (columnIndex: number) => void;
  onDeleteRow: (rowIndex: number) => void;
};

export function TableEditor({
  canEdit,
  table,
  onAddColumn,
  onAddRow,
  onCellChange,
  onClearTable,
  onColumnChange,
  onDeleteColumn,
  onDeleteRow,
}: TableEditorProps) {
  return (
    <section className="panel table-panel" aria-labelledby="table-editor-title">
      <div className="panel-heading table-heading">
        <div>
          <p className="panel-kicker">编辑</p>
          <h3 id="table-editor-title">表格编辑</h3>
        </div>
        <div className="toolbar">
          <Button disabled={!canEdit} onClick={onAddRow} size="sm">
            加行
          </Button>
          <Button disabled={!canEdit} onClick={onAddColumn} size="sm">
            加列
          </Button>
          <Button disabled={!canEdit} onClick={onClearTable} size="sm" variant="ghost">
            清空
          </Button>
        </div>
      </div>
      <TableGrid
        table={table}
        onCellChange={onCellChange}
        onColumnChange={onColumnChange}
        onDeleteColumn={onDeleteColumn}
        onDeleteRow={onDeleteRow}
      />
    </section>
  );
}
