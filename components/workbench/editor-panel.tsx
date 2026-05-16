import type { TableData } from '@/lib/table/types';
import { TableEditor } from '@/components/table-editor/table-editor';

type EditorPanelProps = {
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

export function EditorPanel(props: EditorPanelProps) {
  return <TableEditor {...props} />;
}
