'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { resolveConverter } from '@/lib/converters/resolve-converter';
import {
  converterCatalog,
  FORMAT_LABELS as formatLabels,
  FORMAT_OPTIONS as formatOptions,
  type ConverterFormat,
} from '@/lib/converters/catalog';
import { FORMAT_MODULES, type GeneratorOptions } from '@/lib/converters/formats';
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
  transposeTable,
  deleteEmptyRows,
  deduplicateRows,
  transformCase,
} from '@/lib/table/ops';
import { SourcePanel } from '@/components/workbench/source-panel';
import { EditorPanel } from '@/components/workbench/editor-panel';
import { OutputPanel } from '@/components/workbench/output-panel';
import { OptionsPanel } from '@/components/workbench/options-panel';

type WorkbenchState = {
  inputFormat: ConverterFormat;
  outputFormat: ConverterFormat;
  sourceText: string;
  sourceName?: string;
  parsedAsFormat?: ConverterFormat;
  table: TableData;
  outputText: string;
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
  | { type: 'optionsChanged'; value: Partial<GeneratorOptions> }
  | { type: 'tableTransposed' }
  | { type: 'emptyRowsDeleted' }
  | { type: 'rowsDeduplicated' }
  | { type: 'caseTransformed'; caseType: 'upper' | 'lower' };

const emptyTable = createTableData([], []);

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const defaultOptions: GeneratorOptions = {
  prettyJson: true,
  jsonShape: 'array',
  csvDelimiter: ',',
  includeCsvHeader: true,
  sqlTableName: 'data_table',
  includeCreateTable: false,
  sqlMultiRowInsert: false,
  excelSheetName: 'Sheet1',
};

function parseSourceText(sourceText: string, inputFormat: ConverterFormat): TableData {
  if (sourceText.trim().length === 0) {
    return emptyTable;
  }

  return FORMAT_MODULES[inputFormat].parseText(sourceText);
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

function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/]/g, '_')
    .replace(/[\x00-\x1f]/g, '')
    .slice(0, 200)
    .trim();
}

function deriveOutputFileName(
  sourceName: string | undefined,
  inputFormat: ConverterFormat,
  outputFormat: ConverterFormat,
): string {
  const fallback = `${inputFormat}-to-${outputFormat}`;
  if (!sourceName) {
    return fallback;
  }
  const baseName = sourceName.replace(/\.[^./\\]+$/, '');
  const cleaned = sanitizeFileName(baseName);
  return cleaned || fallback;
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
): string {
  if (!hasTableData(table)) {
    return '';
  }

  const generate = FORMAT_MODULES[outputFormat].generateText;
  if (generate) {
    return generate(table, options);
  }

  return 'Excel 文件已生成，可以下载使用。';
}

function withGeneratedOutput(state: WorkbenchState, table: TableData, nextState: Partial<WorkbenchState> = {}): WorkbenchState {
  const outputFormat = nextState.outputFormat ?? state.outputFormat;
  const options = nextState.options ?? state.options;
  return {
    ...state,
    ...nextState,
    table,
    outputText: generateOutput(table, outputFormat, options),
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

  if (action.type === 'tableTransposed') {
    return withGeneratedOutput(state, transposeTable(state.table), { notice: '已转置表格。' });
  }

  if (action.type === 'emptyRowsDeleted') {
    return withGeneratedOutput(state, deleteEmptyRows(state.table), { notice: '已删除空行。' });
  }

  if (action.type === 'rowsDeduplicated') {
    return withGeneratedOutput(state, deduplicateRows(state.table), { notice: '已删除重复行。' });
  }

  if (action.type === 'caseTransformed') {
    return withGeneratedOutput(state, transformCase(state.table, action.caseType), { notice: '已转换大小写。' });
  }

  if (action.type === 'exampleLoaded') {
    try {
      const sourceText = FORMAT_MODULES[state.inputFormat].exampleSource;
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
    options: defaultOptions,
  });
  const readRequestIdRef = useRef(0);
  const parseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sourceTextDraft, setSourceTextDraft] = useState('');

  function cancelPendingParse() {
    if (parseTimerRef.current) {
      clearTimeout(parseTimerRef.current);
      parseTimerRef.current = null;
    }
  }

  useEffect(() => {
    setSourceTextDraft(state.sourceText);
  }, [state.sourceText]);

  useEffect(() => {
    return () => {
      if (parseTimerRef.current) {
        clearTimeout(parseTimerRef.current);
      }
    };
  }, []);

  const canEditTable = hasTableData(state.table);
  const statusLabel = state.error ? '需要检查' : canEditTable ? '已就绪' : '等待数据';
  const statusClass = state.error ? 'status-danger' : canEditTable ? 'status-ready' : '';
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
    cancelPendingParse();

    if (file.size > MAX_UPLOAD_BYTES) {
      dispatch({
        type: 'parseFailed',
        sourceName: file.name,
        message: `${file.name} 超过单文件 ${formatFileSize(MAX_UPLOAD_BYTES)} 上限,请拆分后再上传。`,
      });
      setFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
      });
      return;
    }

    const requestId = readRequestIdRef.current + 1;
    readRequestIdRef.current = requestId;
    const inputFormatSnapshot = state.inputFormat;

    setIsReadingFile(true);
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
    });

    try {
      const result = await readFileAsTable(file, inputFormatSnapshot);
      if (requestId !== readRequestIdRef.current) {
        return;
      }
      dispatch({ type: 'fileParsed', fileName: file.name, ...result });
    } catch {
      if (requestId !== readRequestIdRef.current) {
        return;
      }
      dispatch({
        type: 'parseFailed',
        sourceName: file.name,
        message: `无法读取 ${file.name}，请确认文件内容和当前输入格式匹配。`,
      });
    } finally {
      if (requestId === readRequestIdRef.current) {
        setIsReadingFile(false);
      }
    }
  }

  function handleInputFormatChange(value: ConverterFormat) {
    cancelPendingParse();
    readRequestIdRef.current += 1;
    setIsReadingFile(false);
    setFileInfo(undefined);
    if (sourceTextDraft !== state.sourceText) {
      dispatch({ type: 'sourceTextChanged', value: sourceTextDraft });
    }
    dispatch({ type: 'inputFormatChanged', value });
  }

  function handleOutputFormatChange(value: ConverterFormat) {
    dispatch({ type: 'outputFormatChanged', value });
  }

  return (
    <section id="workbench" className="workbench" aria-labelledby="workbench-title">
      <h2 id="workbench-title" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        在线转换工作台
      </h2>

      <div className="workbench-stack">
        <SourcePanel
          detectedFormat={detectedFormat}
          error={state.error}
          fileInfo={fileInfo}
          formatOptions={formatOptions}
          inputFormat={state.inputFormat}
          inputHint={inputHint}
          isReadingFile={isReadingFile}
          onInputFormatChange={handleInputFormatChange}
          sourceName={state.sourceName}
          sourceText={sourceTextDraft}
          onFileSelected={handleFileSelected}
          onParseAsDetectedFormat={
            detectedFormat
              ? () => {
                  cancelPendingParse();
                  if (sourceTextDraft !== state.sourceText) {
                    dispatch({ type: 'sourceTextChanged', value: sourceTextDraft });
                  }
                  dispatch({ type: 'sourceTextParsedAs', inputFormat: detectedFormat.format });
                }
              : undefined
          }
          onSourceTextChange={(value) => {
            setFileInfo(undefined);
            setSourceTextDraft(value);
            cancelPendingParse();
            parseTimerRef.current = setTimeout(() => {
              dispatch({ type: 'sourceTextChanged', value });
            }, 200);
          }}
          onUseExample={() => {
            cancelPendingParse();
            setFileInfo(undefined);
            dispatch({ type: 'exampleLoaded' });
          }}
        />

        <EditorPanel
          canEdit={canEditTable}
          statusLabel={statusLabel}
          statusClass={statusClass}
          table={state.table}
          onAddColumn={() => dispatch({ type: 'columnAdded' })}
          onAddRow={() => dispatch({ type: 'rowAdded' })}
          onCellChange={(rowIndex, columnIndex, value) => dispatch({ type: 'cellChanged', rowIndex, columnIndex, value })}
          onClearTable={() => {
            cancelPendingParse();
            dispatch({ type: 'tableCleared' });
          }}
          onColumnChange={(columnIndex, value) => dispatch({ type: 'columnChanged', columnIndex, value })}
          onDeleteColumn={(columnIndex) => dispatch({ type: 'columnDeleted', columnIndex })}
          onDeleteRow={(rowIndex) => dispatch({ type: 'rowDeleted', rowIndex })}
          onTranspose={() => dispatch({ type: 'tableTransposed' })}
          onDeleteEmpty={() => dispatch({ type: 'emptyRowsDeleted' })}
          onDeduplicate={() => dispatch({ type: 'rowsDeduplicated' })}
          onTransformCase={(caseType) => dispatch({ type: 'caseTransformed', caseType })}
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
            outputFileName={deriveOutputFileName(state.sourceName, state.inputFormat, state.outputFormat)}
            outputFormat={state.outputFormat}
            outputText={state.outputText}
            table={state.table}
          />
        </section>
      </div>
    </section>
  );
}
