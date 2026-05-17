'use client';

import Link from 'next/link';
import { useMemo, useReducer, useState } from 'react';
import { resolveConverter } from '@/lib/converters/resolve-converter';
import { converterCatalog, type ConverterFormat } from '@/lib/converters/catalog';
import type { TableData } from '@/lib/table/types';
import {
  addColumn,
  addRow,
  clearTable,
  createTableData,
  deleteColumn,
  deleteRow,
  updateCell,
  updateColumn,
} from '@/lib/table/ops';
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
import { SourcePanel } from '@/components/workbench/source-panel';
import { EditorPanel } from '@/components/workbench/editor-panel';
import { OutputPanel } from '@/components/workbench/output-panel';
import { OptionsPanel } from '@/components/workbench/options-panel';

type GeneratorOptions = {
  prettyJson: boolean;
  jsonShape: 'array' | 'object';
  csvDelimiter: ',' | ';' | '\t';
  includeCsvHeader: boolean;
  sqlTableName: string;
  includeCreateTable: boolean;
  excelSheetName: string;
};

type WorkbenchState = {
  inputFormat: ConverterFormat;
  outputFormat: ConverterFormat;
  sourceText: string;
  sourceName?: string;
  parsedAsFormat?: ConverterFormat;
  table: TableData;
  outputText: string;
  outputBinary?: Uint8Array;
  error?: string;
  notice?: string;
  options: GeneratorOptions;
};

type SourceFileInfo = {
  name: string;
  size: string;
};

type WorkbenchAction =
  | { type: 'sourceTextChanged'; value: string }
  | { type: 'sourceTextParsedAs'; inputFormat: ConverterFormat }
  | { type: 'inputFormatChanged'; value: ConverterFormat }
  | { type: 'outputFormatChanged'; value: ConverterFormat }
  | { type: 'fileParsed'; table: TableData; fileName: string; sourceText?: string }
  | { type: 'parseFailed'; message: string; sourceName?: string }
  | { type: 'cellChanged'; rowIndex: number; columnIndex: number; value: string }
  | { type: 'columnChanged'; columnIndex: number; value: string }
  | { type: 'rowAdded' }
  | { type: 'rowDeleted'; rowIndex: number }
  | { type: 'columnAdded' }
  | { type: 'columnDeleted'; columnIndex: number }
  | { type: 'tableCleared' }
  | { type: 'exampleLoaded' }
  | { type: 'optionsChanged'; value: Partial<GeneratorOptions> };

const emptyTable = createTableData([], []);

const defaultOptions: GeneratorOptions = {
  prettyJson: true,
  jsonShape: 'array',
  csvDelimiter: ',',
  includeCsvHeader: true,
  sqlTableName: 'data_table',
  includeCreateTable: false,
  excelSheetName: 'Sheet1',
};

const exampleSources: Record<ConverterFormat, string> = {
  csv: 'name,age,role\nAda,36,Engineer\nLin,30,Designer',
  json: '[{"name":"Ada","age":"36","role":"Engineer"},{"name":"Lin","age":"30","role":"Designer"}]',
  markdown: '| name | age | role |\n| --- | --- | --- |\n| Ada | 36 | Engineer |\n| Lin | 30 | Designer |',
  html: '<table><thead><tr><th>name</th><th>age</th><th>role</th></tr></thead><tbody><tr><td>Ada</td><td>36</td><td>Engineer</td></tr><tr><td>Lin</td><td>30</td><td>Designer</td></tr></tbody></table>',
  sql: "INSERT INTO `data_table` (`name`, `age`, `role`) VALUES ('Ada', '36', 'Engineer');\nINSERT INTO `data_table` (`name`, `age`, `role`) VALUES ('Lin', '30', 'Designer');",
  excel: 'name,age,role\nAda,36,Engineer\nLin,30,Designer',
};

const formatLabels: Record<ConverterFormat, string> = {
  csv: 'CSV',
  excel: 'Excel',
  html: 'HTML',
  json: 'JSON',
  markdown: 'Markdown',
  sql: 'SQL',
};

const formatOptions = (Object.keys(formatLabels) as ConverterFormat[]).map((format) => ({
  label: formatLabels[format],
  value: format,
}));

function parseSourceText(sourceText: string, inputFormat: ConverterFormat): TableData {
  if (sourceText.trim().length === 0) {
    return emptyTable;
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

function getParseErrorMessage(inputFormat: ConverterFormat): string {
  const label = inputFormat.toUpperCase();
  return `请检查 ${label} 数据格式，修正后会自动生成结果。`;
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getSourceHint(sourceText: string, inputFormat: ConverterFormat, table: TableData) {
  const trimmed = sourceText.trim();

  if (!trimmed) {
    return undefined;
  }

  if (inputFormat === 'json' && !/^\s*[\[{]/.test(sourceText)) {
    return 'JSON 通常以 { 或 [ 开头，请确认粘贴内容是否完整。';
  }

  if (inputFormat === 'markdown' && !trimmed.includes('|')) {
    return 'Markdown 表格通常包含 | 分隔符。';
  }

  if (inputFormat === 'html' && !/<table[\s>]/i.test(sourceText)) {
    return 'HTML 表格通常包含 <table> 标签。';
  }

  if (inputFormat === 'sql' && !/(insert\s+into|values\s*\()/i.test(sourceText)) {
    return 'SQL 输入目前主要识别 INSERT INTO 语句。';
  }

  if ((inputFormat === 'csv' || inputFormat === 'excel') && table.columns.length <= 1 && table.rows.length > 0) {
    return '如果数据来自 Excel，可以直接复制多列内容粘贴进来。';
  }

  return `已识别 ${table.columns.length} 列、${table.rows.length} 行。`;
}

function detectSourceFormat(sourceText: string): ConverterFormat | undefined {
  const trimmed = sourceText.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^[[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      return undefined;
    }
  }

  if (/<table[\s>]/i.test(trimmed)) {
    return 'html';
  }

  if (/\binsert\s+into\b/i.test(trimmed) && /\bvalues\s*\(/i.test(trimmed)) {
    return 'sql';
  }

  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  if (lines.length >= 2 && lines[0].includes('|') && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[1])) {
    return 'markdown';
  }

  if (lines.length >= 2 && lines[0].includes('\t')) {
    return 'csv';
  }

  if (lines.length >= 2 && lines[0].includes(',') && lines.some((line) => line.includes(','))) {
    return 'csv';
  }

  return undefined;
}

function hasTableData(table: TableData): boolean {
  return table.columns.length > 0 || table.rows.length > 0;
}

function generateOutput(
  table: TableData,
  outputFormat: ConverterFormat,
  options: GeneratorOptions,
): Pick<WorkbenchState, 'outputText' | 'outputBinary'> {
  if (!hasTableData(table)) {
    return { outputText: '', outputBinary: undefined };
  }

  if (outputFormat === 'json') {
    return {
      outputText: generateJson(table, {
        pretty: options.prettyJson,
        shape: options.jsonShape,
      }),
      outputBinary: undefined,
    };
  }

  if (outputFormat === 'csv') {
    return {
      outputText: generateCsv(table, {
        delimiter: options.csvDelimiter,
        includeHeader: options.includeCsvHeader,
      }),
      outputBinary: undefined,
    };
  }

  if (outputFormat === 'markdown') {
    return { outputText: generateMarkdown(table), outputBinary: undefined };
  }

  if (outputFormat === 'html') {
    return { outputText: generateHtml(table), outputBinary: undefined };
  }

  if (outputFormat === 'sql') {
    return {
      outputText: generateSql(table, {
        tableName: options.sqlTableName,
        includeCreateTable: options.includeCreateTable,
      }),
      outputBinary: undefined,
    };
  }

  return {
    outputText: 'Excel 文件已生成，可以下载使用。',
    outputBinary: undefined,
  };
}

function withGeneratedOutput(state: WorkbenchState, table: TableData, nextState: Partial<WorkbenchState> = {}): WorkbenchState {
  return {
    ...state,
    ...nextState,
    table,
    ...generateOutput(table, nextState.outputFormat ?? state.outputFormat, nextState.options ?? state.options),
  };
}

function reducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
  if (action.type === 'sourceTextChanged') {
    try {
      const table = parseSourceText(action.value, state.inputFormat);
      return withGeneratedOutput(state, table, {
        sourceText: action.value,
        sourceName: undefined,
        parsedAsFormat: undefined,
        error: undefined,
        notice: action.value.trim() ? '已根据输入内容更新结果。' : undefined,
      });
    } catch {
      return {
        ...state,
        sourceText: action.value,
        parsedAsFormat: undefined,
        table: emptyTable,
        outputText: '',
        outputBinary: undefined,
        error: getParseErrorMessage(state.inputFormat),
        notice: undefined,
      };
    }
  }

  if (action.type === 'sourceTextParsedAs') {
    try {
      const table = parseSourceText(state.sourceText, action.inputFormat);
      return withGeneratedOutput(state, table, {
        inputFormat: action.inputFormat,
        error: undefined,
        parsedAsFormat: action.inputFormat,
        notice: `已按 ${formatLabels[action.inputFormat]} 解析。`,
      });
    } catch {
      return {
        ...state,
        table: emptyTable,
        outputText: '',
        outputBinary: undefined,
        error: getParseErrorMessage(action.inputFormat),
        notice: undefined,
      };
    }
  }

  if (action.type === 'inputFormatChanged') {
    if (!state.sourceText.trim() && hasTableData(state.table)) {
      return withGeneratedOutput(state, state.table, {
        inputFormat: action.value,
        error: undefined,
        parsedAsFormat: undefined,
        sourceName: undefined,
        notice: `已切换为 ${formatLabels[action.value]} 输入。`,
      });
    }

    try {
      const table = parseSourceText(state.sourceText, action.value);
      return withGeneratedOutput(state, table, {
        inputFormat: action.value,
        error: undefined,
        parsedAsFormat: undefined,
        sourceName: undefined,
        notice: state.sourceText.trim() ? `已按 ${formatLabels[action.value]} 重新解析。` : undefined,
      });
    } catch {
      return {
        ...state,
        inputFormat: action.value,
        parsedAsFormat: undefined,
        sourceName: undefined,
        table: emptyTable,
        outputText: '',
        outputBinary: undefined,
        error: getParseErrorMessage(action.value),
        notice: undefined,
      };
    }
  }

  if (action.type === 'outputFormatChanged') {
    return withGeneratedOutput(state, state.table, {
      outputFormat: action.value,
      notice: hasTableData(state.table) ? `已生成 ${formatLabels[action.value]} 结果。` : undefined,
    });
  }

  if (action.type === 'fileParsed') {
    return withGeneratedOutput(state, action.table, {
      sourceText: action.sourceText ?? '',
      sourceName: action.fileName,
      parsedAsFormat: undefined,
      error: undefined,
      notice: `已读取 ${action.fileName}。`,
    });
  }

  if (action.type === 'parseFailed') {
    return {
      ...state,
      sourceName: action.sourceName,
      parsedAsFormat: undefined,
      error: action.message,
      notice: undefined,
      outputText: '',
      outputBinary: undefined,
    };
  }

  if (action.type === 'cellChanged') {
    return withGeneratedOutput(state, updateCell(state.table, action.rowIndex, action.columnIndex, action.value), {
      notice: '已更新转换结果。',
    });
  }

  if (action.type === 'columnChanged') {
    return withGeneratedOutput(state, updateColumn(state.table, action.columnIndex, action.value), {
      notice: '已更新字段名称。',
    });
  }

  if (action.type === 'rowAdded') {
    return withGeneratedOutput(state, addRow(state.table), { notice: '已添加一行。' });
  }

  if (action.type === 'rowDeleted') {
    return withGeneratedOutput(state, deleteRow(state.table, action.rowIndex), { notice: '已删除该行。' });
  }

  if (action.type === 'columnAdded') {
    return withGeneratedOutput(state, addColumn(state.table), { notice: '已添加一列。' });
  }

  if (action.type === 'columnDeleted') {
    return withGeneratedOutput(state, deleteColumn(state.table, action.columnIndex), { notice: '已删除该列。' });
  }

  if (action.type === 'tableCleared') {
    return withGeneratedOutput(state, clearTable(), {
      sourceText: '',
      sourceName: undefined,
      parsedAsFormat: undefined,
      error: undefined,
      notice: '已清空表格。',
    });
  }

  if (action.type === 'exampleLoaded') {
    try {
      const sourceText = exampleSources[state.inputFormat];
      const table = parseSourceText(sourceText, state.inputFormat === 'excel' ? 'csv' : state.inputFormat);
      return withGeneratedOutput(state, table, {
        sourceText,
        sourceName: undefined,
        parsedAsFormat: undefined,
        error: undefined,
        notice: '已载入示例数据。',
      });
    } catch {
      return state;
    }
  }

  if (action.type === 'optionsChanged') {
    const options = { ...state.options, ...action.value };
    return withGeneratedOutput(state, state.table, { options, notice: '已按新选项生成结果。' });
  }

  return state;
}

async function readFileAsTable(file: File, inputFormat: ConverterFormat): Promise<{ table: TableData; sourceText?: string }> {
  if (inputFormat === 'excel' || /\.(xlsx|xls)$/i.test(file.name)) {
    const { parseExcel } = await import('@/lib/parsers/parse-excel');
    return { table: parseExcel(await file.arrayBuffer()) };
  }

  const sourceText = await file.text();
  return { table: parseSourceText(sourceText, inputFormat), sourceText };
}

type ConverterWorkbenchProps = {
  initialConverterId?: string;
};

export function ConverterWorkbench({ initialConverterId = 'excel-to-json' }: ConverterWorkbenchProps) {
  const converter = resolveConverter(initialConverterId) ?? resolveConverter('excel-to-json');
  const initialInputFormat = converter?.inputFormat ?? 'excel';
  const initialOutputFormat = converter?.outputFormat ?? 'json';
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileInfo, setFileInfo] = useState<SourceFileInfo | undefined>(undefined);
  const [state, dispatch] = useReducer(reducer, {
    inputFormat: initialInputFormat,
    outputFormat: initialOutputFormat,
    sourceText: '',
    table: emptyTable,
    outputText: '',
    outputBinary: undefined,
    options: defaultOptions,
  });
  const formatLabel = useMemo(
    () => `${state.inputFormat.toUpperCase()} 转 ${state.outputFormat.toUpperCase()}`,
    [state.inputFormat, state.outputFormat],
  );
  const canEditTable = hasTableData(state.table);
  const statusLabel = state.error ? '需要检查' : canEditTable ? '已就绪' : '等待数据';
  const inputHint = state.error ? undefined : getSourceHint(state.sourceText, state.inputFormat, state.table);
  const matchingConverter = converterCatalog.find(
    (catalogItem) => catalogItem.inputFormat === state.inputFormat && catalogItem.outputFormat === state.outputFormat,
  );
  const matchingConverterLink = matchingConverter?.slug !== initialConverterId ? matchingConverter : undefined;
  const detectedInputFormat = detectSourceFormat(state.sourceText);
  const detectedFormat =
    detectedInputFormat &&
    detectedInputFormat !== state.inputFormat &&
    detectedInputFormat !== state.parsedAsFormat
      ? {
          format: detectedInputFormat,
          label: formatLabels[detectedInputFormat],
        }
      : undefined;

  async function handleFileSelected(file: File) {
    setIsReadingFile(true);
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
    });

    try {
      const result = await readFileAsTable(file, state.inputFormat);
      dispatch({ type: 'fileParsed', fileName: file.name, ...result });
    } catch {
      dispatch({
        type: 'parseFailed',
        sourceName: file.name,
        message: `无法读取 ${file.name}，请确认文件内容和当前输入格式匹配。`,
      });
    } finally {
      setIsReadingFile(false);
    }
  }

  function handleInputFormatChange(value: ConverterFormat) {
    setFileInfo(undefined);
    dispatch({ type: 'inputFormatChanged', value });
  }

  function handleOutputFormatChange(value: ConverterFormat) {
    dispatch({ type: 'outputFormatChanged', value });
  }

  return (
    <section className="workbench" aria-labelledby="workbench-title">
      <header className="workbench-topbar">
        <div className="workbench-brand">
          <span className="brand-mark">T</span>
          <div>
            <p className="eyebrow">{formatLabel}</p>
            <h2 id="workbench-title">在线转换工具</h2>
          </div>
        </div>
        <div className="workbench-top-actions">
          <span className={`status-pill ${state.error ? 'status-danger' : canEditTable ? 'status-ready' : ''}`}>
            {statusLabel}
          </span>
          <span>{state.table.columns.length} 列</span>
          <span>{state.table.rows.length} 行</span>
        </div>
      </header>

      <div className="workbench-stack">
        <section className="input-format-strip" aria-label="输入格式">
          <label className="field format-select-field">
            <span>输入格式</span>
            <select
              className="control"
              name="input-format"
              onChange={(event) => handleInputFormatChange(event.target.value as ConverterFormat)}
              value={state.inputFormat}
            >
              {formatOptions.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </label>
          <span>粘贴或上传 {formatLabels[state.inputFormat]} 数据。</span>
        </section>

        <SourcePanel
          detectedFormat={detectedFormat}
          error={state.error}
          fileInfo={fileInfo}
          inputFormat={state.inputFormat}
          inputHint={inputHint}
          isReadingFile={isReadingFile}
          sourceName={state.sourceName}
          sourceText={state.sourceText}
          onFileSelected={handleFileSelected}
          onParseAsDetectedFormat={
            detectedFormat ? () => dispatch({ type: 'sourceTextParsedAs', inputFormat: detectedFormat.format }) : undefined
          }
          onSourceTextChange={(value) => {
            setFileInfo(undefined);
            dispatch({ type: 'sourceTextChanged', value });
          }}
          onUseExample={() => {
            setFileInfo(undefined);
            dispatch({ type: 'exampleLoaded' });
          }}
        />

        <EditorPanel
          canEdit={canEditTable}
          table={state.table}
          onAddColumn={() => dispatch({ type: 'columnAdded' })}
          onAddRow={() => dispatch({ type: 'rowAdded' })}
          onCellChange={(rowIndex, columnIndex, value) => dispatch({ type: 'cellChanged', rowIndex, columnIndex, value })}
          onClearTable={() => dispatch({ type: 'tableCleared' })}
          onColumnChange={(columnIndex, value) => dispatch({ type: 'columnChanged', columnIndex, value })}
          onDeleteColumn={(columnIndex) => dispatch({ type: 'columnDeleted', columnIndex })}
          onDeleteRow={(rowIndex) => dispatch({ type: 'rowDeleted', rowIndex })}
        />

        <section className="generator-panel" aria-label="生成结果">
          <OptionsPanel
            formatOptions={formatOptions}
            matchingConverterLink={matchingConverterLink}
            options={state.options}
            outputFormat={state.outputFormat}
            onOptionsChange={(value) => dispatch({ type: 'optionsChanged', value })}
            onOutputFormatChange={(value) => handleOutputFormatChange(value)}
          />
          <OutputPanel
            excelSheetName={state.options.excelSheetName}
            notice={state.notice}
            outputFileName={`${state.inputFormat}-to-${state.outputFormat}`}
            outputFormat={state.outputFormat}
            outputText={state.outputText}
            table={state.table}
          />
        </section>
      </div>
    </section>
  );
}
