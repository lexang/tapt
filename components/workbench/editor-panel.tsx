import type { TableData } from '@/lib/table/types';
import { TableEditor } from '@/components/table-editor/table-editor';

type EditorPanelProps = {
  table: TableData;
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void;
};

export function EditorPanel({ table, onCellChange }: EditorPanelProps) {
  return <TableEditor table={table} onCellChange={onCellChange} />;
}
