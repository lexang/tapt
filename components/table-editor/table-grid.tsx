import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { TableData } from '@/lib/table/types';
import { Button } from '@/components/ui/button';

type TableGridProps = {
  table: TableData;
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void;
  onColumnChange: (columnIndex: number, value: string) => void;
  onDeleteColumn: (columnIndex: number) => void;
  onDeleteRow: (rowIndex: number) => void;
};

type CommitInputProps = {
  ariaLabel: string;
  inputRef: (element: HTMLInputElement | null) => void;
  name: string;
  value: string;
  onCommit: (value: string) => void;
  onMove: (key: NavigationKey, shiftKey: boolean) => void;
};

type NavigationKey = 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'Enter' | 'Tab';

type CellPosition = {
  columnIndex: number;
  rowIndex: number;
};

function CommitInput({ ariaLabel, inputRef, name, onCommit, onMove, value }: CommitInputProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  function shouldMoveHorizontally(event: KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;

    if (event.key === 'ArrowLeft') {
      return input.selectionStart === 0 && input.selectionEnd === 0;
    }

    if (event.key === 'ArrowRight') {
      return input.selectionStart === draftValue.length && input.selectionEnd === draftValue.length;
    }

    return true;
  }

  return (
    <input
      aria-label={ariaLabel}
      autoComplete="off"
      name={name}
      onChange={(event) => setDraftValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault();
          onCommit(draftValue);
          onMove(event.key, event.shiftKey);
          return;
        }

        if (
          ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(event.key) &&
          shouldMoveHorizontally(event)
        ) {
          event.preventDefault();
          onCommit(draftValue);
          onMove(event.key as NavigationKey, event.shiftKey);
          return;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          setDraftValue(value);
          event.currentTarget.blur();
        }
      }}
      onFocus={(event) => event.currentTarget.select()}
      ref={inputRef}
      value={draftValue}
    />
  );
}

function getCellKey(position: CellPosition) {
  return `${position.rowIndex}:${position.columnIndex}`;
}

export function TableGrid({
  table,
  onCellChange,
  onColumnChange,
  onDeleteColumn,
  onDeleteRow,
}: TableGridProps) {
  const inputRefs = useRef(new Map<string, HTMLInputElement>());

  if (table.columns.length === 0) {
    return (
      <div className="empty-table">
        <strong>还没有可预览的表格</strong>
        <span>粘贴数据、上传文件或使用示例后，可以在这里检查和修改内容。</span>
      </div>
    );
  }

  function setInputRef(position: CellPosition, element: HTMLInputElement | null) {
    const key = getCellKey(position);

    if (element) {
      inputRefs.current.set(key, element);
      return;
    }

    inputRefs.current.delete(key);
  }

  function focusCell(position: CellPosition) {
    window.setTimeout(() => {
      const nextInput = inputRefs.current.get(getCellKey(position));

      if (!nextInput) {
        return;
      }

      nextInput.focus();
      nextInput.select();
    }, 0);
  }

  function getNextPosition(position: CellPosition, key: NavigationKey): CellPosition {
    const lastColumnIndex = table.columns.length - 1;
    const lastRowIndex = table.rows.length - 1;

    if (position.rowIndex === -1) {
      if (key === 'ArrowDown' || key === 'Enter') {
        return { rowIndex: 0, columnIndex: position.columnIndex };
      }

      if (key === 'ArrowLeft') {
        return {
          rowIndex: -1,
          columnIndex: Math.max(0, position.columnIndex - 1),
        };
      }

      if (key === 'ArrowRight' || key === 'Tab') {
        return {
          rowIndex: -1,
          columnIndex: Math.min(lastColumnIndex, position.columnIndex + 1),
        };
      }

      return position;
    }

    if (key === 'ArrowUp') {
      if (position.rowIndex === 0) {
        return { rowIndex: -1, columnIndex: position.columnIndex };
      }

      return { ...position, rowIndex: Math.max(0, position.rowIndex - 1) };
    }

    if (key === 'ArrowDown' || key === 'Enter') {
      return { ...position, rowIndex: Math.min(lastRowIndex, position.rowIndex + 1) };
    }

    if (key === 'ArrowLeft') {
      if (position.columnIndex > 0) {
        return { ...position, columnIndex: position.columnIndex - 1 };
      }

      return position;
    }

    if (key === 'ArrowRight' || key === 'Tab') {
      if (position.columnIndex < lastColumnIndex) {
        return { ...position, columnIndex: position.columnIndex + 1 };
      }

      if (position.rowIndex < lastRowIndex) {
        return { rowIndex: position.rowIndex + 1, columnIndex: 0 };
      }

      return position;
    }

    if (position.columnIndex < lastColumnIndex) {
      return { ...position, columnIndex: position.columnIndex + 1 };
    }

    if (position.rowIndex < lastRowIndex) {
      return { rowIndex: position.rowIndex + 1, columnIndex: 0 };
    }

    return position;
  }

  function moveFrom(position: CellPosition, key: NavigationKey, shiftKey = false) {
    if (key === 'Tab' && shiftKey) {
      focusCell(getNextPosition(position, 'ArrowLeft'));
      return;
    }

    focusCell(getNextPosition(position, key));
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
                  <CommitInput
                    ariaLabel={`第 ${columnIndex + 1} 列名称`}
                    inputRef={(element) => setInputRef({ rowIndex: -1, columnIndex }, element)}
                    name={`column-${columnIndex}`}
                    onCommit={(value) => onColumnChange(columnIndex, value)}
                    onMove={(key) => moveFrom({ rowIndex: -1, columnIndex }, key)}
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
                  <CommitInput
                    ariaLabel={`${column || `第 ${columnIndex + 1} 列`} 第 ${rowIndex + 1} 行`}
                    inputRef={(element) => setInputRef({ rowIndex, columnIndex }, element)}
                    name={`cell-${rowIndex}-${columnIndex}`}
                    onCommit={(value) => onCellChange(rowIndex, columnIndex, value)}
                    onMove={(key) => moveFrom({ rowIndex, columnIndex }, key)}
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
