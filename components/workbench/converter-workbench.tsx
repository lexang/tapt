'use client';

import { useMemo, useReducer } from 'react';
import { resolveConverter } from '@/lib/converters/resolve-converter';
import type { ConverterFormat } from '@/lib/converters/catalog';
import type { TableData } from '@/lib/table/types';
import { createTableData } from '@/lib/table/ops';
import { parseCsv } from '@/lib/parsers/parse-csv';
import { parseJson } from '@/lib/parsers/parse-json';
import { parseMarkdown } from '@/lib/parsers/parse-markdown';
import { parseHtml } from '@/lib/parsers/parse-html';
import { parseSql } from '@/lib/parsers/parse-sql';
import { generateJson } from '@/lib/generators/generate-json';
import { generateCsv } from '@/lib/generators/generate-csv';
import { generateMarkdown } from '@/lib/generators/generate-markdown';
import { generateHtml } from '@/lib/generators/generate-html';
import { generateSql } from '@/lib/generators/generate-sql';
import { generateExcel } from '@/lib/generators/generate-excel';
import { SourcePanel } from '@/components/workbench/source-panel';
import { EditorPanel } from '@/components/workbench/editor-panel';
import { OutputPanel } from '@/components/workbench/output-panel';

type WorkbenchState = {
  inputFormat: ConverterFormat;
  outputFormat: ConverterFormat;
  sourceText: string;
  table: TableData;
  outputText: string;
  outputBinary?: Uint8Array;
  prettyJson: boolean;
};

type WorkbenchAction =
  | { type: 'sourceTextChanged'; value: string }
  | { type: 'cellChanged'; rowIndex: number; columnIndex: number; value: string }
  | { type: 'exampleLoaded' }
  | { type: 'prettyJsonChanged'; value: boolean };

const exampleSource = 'name,age\nAda,36';
const exampleTable = createTableData(['name', 'age'], [['Ada', '36']]);

function parseSourceText(sourceText: string, inputFormat: ConverterFormat): TableData {
  if (sourceText.trim().length === 0) {
    return createTableData([], []);
  }

  if (inputFormat === 'json') {
    return parseJson(sourceText);
  }

  if (inputFormat === 'markdown') {
    return parseMarkdown(sourceText);
  }

  if (inputFormat === 'html') {
    return parseHtml(sourceText);
  }

  if (inputFormat === 'sql') {
    return parseSql(sourceText);
  }

  return parseCsv(sourceText);
}

function generateOutput(
  table: TableData,
  outputFormat: ConverterFormat,
  prettyJson: boolean,
): Pick<WorkbenchState, 'outputText' | 'outputBinary'> {
  if (outputFormat === 'json') {
    return { outputText: generateJson(table, { pretty: prettyJson }) };
  }

  if (outputFormat === 'csv') {
    return { outputText: generateCsv(table) };
  }

  if (outputFormat === 'markdown') {
    return { outputText: generateMarkdown(table) };
  }

  if (outputFormat === 'html') {
    return { outputText: generateHtml(table) };
  }

  if (outputFormat === 'sql') {
    return { outputText: generateSql(table) };
  }

  return {
    outputText: 'Excel 文件已生成，可以下载使用。',
    outputBinary: generateExcel(table),
  };
}

function reducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
  if (action.type === 'sourceTextChanged') {
    const table = parseSourceText(action.value, state.inputFormat);
    return {
      ...state,
      sourceText: action.value,
      table,
      ...generateOutput(table, state.outputFormat, state.prettyJson),
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
      ...generateOutput({ ...state.table, rows }, state.outputFormat, state.prettyJson),
    };
  }

  if (action.type === 'exampleLoaded') {
    return {
      ...state,
      sourceText: exampleSource,
      table: exampleTable,
      ...generateOutput(exampleTable, state.outputFormat, state.prettyJson),
    };
  }

  if (action.type === 'prettyJsonChanged') {
    return {
      ...state,
      prettyJson: action.value,
      ...generateOutput(state.table, state.outputFormat, action.value),
    };
  }

  return state;
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
    ...generateOutput(exampleTable, converter?.outputFormat ?? 'json', true),
    prettyJson: true,
  });
  const formatLabel = useMemo(
    () => `${state.inputFormat.toUpperCase()} 转 ${state.outputFormat.toUpperCase()}`,
    [state.inputFormat, state.outputFormat],
  );

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header style={{ display: 'grid', gap: 6 }}>
        <p style={{ margin: 0, color: '#174ea6', fontSize: 14, fontWeight: 700 }}>
          {formatLabel}
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
          outputText={state.outputText}
          outputBinary={state.outputBinary}
          outputFileName={`${initialConverterId}.xlsx`}
          prettyJson={state.prettyJson}
          showPrettyJson={state.outputFormat === 'json'}
          onPrettyJsonChange={(value) => dispatch({ type: 'prettyJsonChanged', value })}
        />
      </div>
    </div>
  );
}
