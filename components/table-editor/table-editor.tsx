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
  onTranspose?: () => void;
  onDeleteEmpty?: () => void;
  onDeduplicate?: () => void;
  onTransformCase?: (caseType: 'upper' | 'lower') => void;
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
  onTranspose,
  onDeleteEmpty,
  onDeduplicate,
  onTransformCase,
}: TableEditorProps) {
  return (
    <section className="panel table-panel" aria-labelledby="table-editor-title">
      <div className="panel-heading table-heading">
        <div>
          <p className="panel-kicker">编辑</p>
          <h3 id="table-editor-title">表格编辑</h3>
        </div>
        <div className="toolbar" style={{ alignItems: 'center' }}>
          <Button disabled={!canEdit} onClick={onTranspose} size="sm" variant="ghost" title="行列转置">转置</Button>
          <Button disabled={!canEdit} onClick={onDeleteEmpty} size="sm" variant="ghost" title="删除空行">删空</Button>
          <Button disabled={!canEdit} onClick={onDeduplicate} size="sm" variant="ghost" title="删除重复行">去重</Button>
          <Button disabled={!canEdit} onClick={() => onTransformCase?.('upper')} size="sm" variant="ghost" title="全大写">大写</Button>
          <Button disabled={!canEdit} onClick={() => onTransformCase?.('lower')} size="sm" variant="ghost" title="全小写">小写</Button>
          <div style={{ width: 1, height: 16, background: 'var(--line-strong)', margin: '0 4px' }} />
          <Button onClick={onAddRow} size="sm">
            加行
          </Button>
          <Button onClick={onAddColumn} size="sm">
            加列
          </Button>
          <Button disabled={!canEdit} onClick={onClearTable} size="sm" variant="ghost" title="清空全部数据">
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
