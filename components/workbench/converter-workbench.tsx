'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { resolveConverter } from '@/lib/converters/resolve-converter';
import {
  converterCatalog,
  FORMAT_LABELS as formatLabels,
  FORMAT_OPTIONS as formatOptions,
  type ConverterFormat,
} from '@/lib/converters/catalog';
import { FORMAT_MODULES } from '@/lib/converters/formats';
import type { TableData } from '@/lib/table/types';
import {
  createInitialState,
  hasTableData,
  parseSourceText,
  reducer,
} from '@/lib/workbench/state';
import { SourcePanel } from '@/components/workbench/source-panel';
import { EditorPanel } from '@/components/workbench/editor-panel';
import { OutputPanel } from '@/components/workbench/output-panel';
import { OptionsPanel } from '@/components/workbench/options-panel';

type SourceFileInfo = {
  name: string;
  size: string;
};

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

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

function readWithReader<T>(
  file: File,
  reader: FileReader,
  kind: 'text' | 'arrayBuffer',
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as T);
    reader.onerror = () => reject(reader.error ?? new Error('文件读取失败'));
    reader.onabort = () => reject(new DOMException('aborted', 'AbortError'));
    if (kind === 'arrayBuffer') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}

async function readFileAsTable(
  file: File,
  inputFormat: ConverterFormat,
  reader: FileReader,
): Promise<{ table: TableData; sourceText?: string }> {
  if (inputFormat === 'excel' || /\.(xlsx|xls)$/i.test(file.name)) {
    const buffer = await readWithReader<ArrayBuffer>(file, reader, 'arrayBuffer');
    const { parseExcel } = await import('@/lib/parsers/parse-excel');
    return { table: parseExcel(buffer) };
  }

  const sourceText = await readWithReader<string>(file, reader, 'text');
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
  const [state, dispatch] = useReducer(
    reducer,
    createInitialState(initialInputFormat, initialOutputFormat),
  );
  const readRequestIdRef = useRef(0);
  const readerRef = useRef<FileReader | null>(null);
  const parseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sourceTextDraft, setSourceTextDraft] = useState('');

  function cancelPendingParse() {
    if (parseTimerRef.current) {
      clearTimeout(parseTimerRef.current);
      parseTimerRef.current = null;
    }
  }

  function abortPendingRead() {
    const reader = readerRef.current;
    if (reader && reader.readyState === 1) {
      reader.abort();
    }
    readerRef.current = null;
  }

  useEffect(() => {
    setSourceTextDraft(state.sourceText);
  }, [state.sourceText]);

  useEffect(() => {
    return () => {
      if (parseTimerRef.current) {
        clearTimeout(parseTimerRef.current);
      }
      abortPendingRead();
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
    abortPendingRead();

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

    const fileExt = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? '' : '';
    const acceptedExts = FORMAT_MODULES[state.inputFormat].extensionAliases;
    if (fileExt && !acceptedExts.includes(fileExt)) {
      dispatch({
        type: 'parseFailed',
        sourceName: file.name,
        message: `.${fileExt} 不在当前 ${state.inputFormat.toUpperCase()} 格式可接受范围(.${acceptedExts.join(' / .')}),请切换输入格式或选择匹配的文件。`,
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
    const reader = new FileReader();
    readerRef.current = reader;

    setIsReadingFile(true);
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
    });

    try {
      const result = await readFileAsTable(file, inputFormatSnapshot, reader);
      if (requestId !== readRequestIdRef.current) {
        return;
      }
      dispatch({ type: 'fileParsed', fileName: file.name, ...result });
    } catch (err) {
      if (requestId !== readRequestIdRef.current) {
        return;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
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
        readerRef.current = null;
      }
    }
  }

  function handleInputFormatChange(value: ConverterFormat) {
    cancelPendingParse();
    abortPendingRead();
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
