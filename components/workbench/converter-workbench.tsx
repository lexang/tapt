'use client';

import { useMemo, useReducer } from 'react';
import { resolveConverter } from '@/lib/converters/resolve-converter';
import type { ConverterFormat } from '@/lib/converters/catalog';
import type { TableData } from '@/lib/table/types';
import { createTableData } from '@/lib/table/ops';
import { parseCsv } from '@/lib/parsers/parse-csv';
import { generateJson } from '@/lib/generators/generate-json';
import { generateCsv } from '@/lib/generators/generate-csv';
import { generateMarkdown } from '@/lib/generators/generate-markdown';
import { generateHtml } from '@/lib/generators/generate-html';
import { generateSql } from '@/lib/generators/generate-sql';
import { SourcePanel } from '@/components/workbench/source-panel';
import { EditorPanel } from '@/components/workbench/editor-panel';
import { OutputPanel } from '@/components/workbench/output-panel';

type WorkbenchState = {
  inputFormat: ConverterFormat;
  outputFormat: ConverterFormat;
  sourceText: string;
  table: TableData;
  prettyJson: boolean;
};

type WorkbenchAction =
  | { type: 'sourceTextChanged'; value: string }
  | { type: 'cellChanged'; rowIndex: number; columnIndex: number; value: string }
  | { type: 'exampleLoaded' }
  | { type: 'prettyJsonChanged'; value: boolean };

const exampleSource = 'name,age\nAda,36';
const exampleTable = createTableData(['name', 'age'], [['Ada', '36']]);

function parseSourceText(sourceText: string): TableData {
  return parseCsv(sourceText);
}

function reducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
  if (action.type === 'sourceTextChanged') {
    return {
      ...state,
      sourceText: action.value,
      table: parseSourceText(action.value),
    };
  }

  if (action.type === 'cellChanged') {
    const rows = state.table.rows.map((row, rowIndex) => {
      if (rowIndex !== action.rowIndex) {
        return row;
      }

      return row.map((cell, columnIndex) => {
        if (columnIndex !== action.columnIndex) {
          return cell;
        }

        return { value: action.value };
      });
    });

    return {
      ...state,
      table: {
        ...state.table,
        rows,
      },
    };
  }

  if (action.type === 'exampleLoaded') {
    return {
      ...state,
      sourceText: exampleSource,
      table: exampleTable,
    };
  }

  if (action.type === 'prettyJsonChanged') {
    return {
      ...state,
      prettyJson: action.value,
    };
  }

  return state;
}

function generateOutput(table: TableData, outputFormat: ConverterFormat, prettyJson: boolean): string {
  if (outputFormat === 'json') {
    return generateJson(table, { pretty: prettyJson });
  }

  if (outputFormat === 'csv') {
    return generateCsv(table);
  }

  if (outputFormat === 'markdown') {
    return generateMarkdown(table);
  }

  if (outputFormat === 'html') {
    return generateHtml(table);
  }

  if (outputFormat === 'sql') {
    return generateSql(table);
  }

  return 'Excel 文件已准备好，可下载使用。';
}

type ConverterWorkbenchProps = {
  initialConverterId?: string;
};

export function ConverterWorkbench({ initialConverterId = 'excel-to-json' }: ConverterWorkbenchProps) {
  const converter = resolveConverter(initialConverterId) ?? resolveConverter('excel-to-json');
  const [state, dispatch] = useReducer(reducer, {
    inputFormat: converter?.inputFormat ?? 'excel',
    outputFormat: converter?.outputFormat ?? 'json',
    sourceText: '',
    table: exampleTable,
    prettyJson: true,
  });
  const outputText = useMemo(
    () => generateOutput(state.table, state.outputFormat, state.prettyJson),
    [state.outputFormat, state.prettyJson, state.table],
  );

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header style={{ display: 'grid', gap: 6 }}>
        <p style={{ margin: 0, color: '#174ea6', fontSize: 14, fontWeight: 700 }}>
          {state.inputFormat.toUpperCase()} 转 {state.outputFormat.toUpperCase()}
        </p>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: 0 }}>表格转换工具</h1>
        <p style={{ margin: 0, color: '#667085' }}>数据在本地浏览器处理，转换结果可以直接复制。</p>
      </header>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <SourcePanel
          sourceText={state.sourceText}
          onSourceTextChange={(value) => dispatch({ type: 'sourceTextChanged', value })}
          onUseExample={() => dispatch({ type: 'exampleLoaded' })}
        />
        <EditorPanel
          table={state.table}
          onCellChange={(rowIndex, columnIndex, value) => dispatch({ type: 'cellChanged', rowIndex, columnIndex, value })}
        />
        <OutputPanel
          outputText={outputText}
          prettyJson={state.prettyJson}
          onPrettyJsonChange={(value) => dispatch({ type: 'prettyJsonChanged', value })}
        />
      </div>
    </div>
  );
}
