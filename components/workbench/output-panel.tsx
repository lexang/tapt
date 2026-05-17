import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ConverterFormat } from '@/lib/converters/catalog';
import type { TableData } from '@/lib/table/types';

type OutputPanelProps = {
  excelSheetName: string;
  notice?: string;
  outputText: string;
  outputFileName?: string;
  outputFormat: ConverterFormat;
  table: TableData;
};

function getEmptyMessage(outputFormat: ConverterFormat): string {
  return `粘贴或上传数据后，这里会显示 ${outputFormat.toUpperCase()} 结果…`;
}

const outputExtensions: Record<ConverterFormat, string> = {
  csv: 'csv',
  excel: 'xlsx',
  html: 'html',
  json: 'json',
  markdown: 'md',
  sql: 'sql',
};

const textMimeTypes: Record<Exclude<ConverterFormat, 'excel'>, string> = {
  csv: 'text/csv;charset=utf-8',
  html: 'text/html;charset=utf-8',
  json: 'application/json;charset=utf-8',
  markdown: 'text/markdown;charset=utf-8',
  sql: 'application/sql;charset=utf-8',
};

function getOutputFileName(outputFormat: ConverterFormat, outputFileName: string) {
  const extension = outputExtensions[outputFormat];

  if (outputFileName.endsWith(`.${extension}`)) {
    return outputFileName;
  }

  return `${outputFileName.replace(/\.[^.]+$/, '')}.${extension}`;
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function OutputPanel({
  excelSheetName,
  notice,
  outputText,
  outputFileName = 'table',
  outputFormat,
  table,
}: OutputPanelProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const hasOutput = Boolean(outputText);
  const isExcelOutput = outputFormat === 'excel';
  const resolvedFileName = getOutputFileName(outputFormat, outputFileName);

  async function downloadOutput() {
    if (!hasOutput) {
      return;
    }

    if (isExcelOutput) {
      const { generateExcel } = await import('@/lib/generators/generate-excel');
      const outputBinary = generateExcel(table, { sheetName: excelSheetName });
      const arrayBuffer = outputBinary.buffer.slice(
        outputBinary.byteOffset,
        outputBinary.byteOffset + outputBinary.byteLength,
      ) as ArrayBuffer;
      saveBlob(
        new Blob([arrayBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        resolvedFileName,
      );
      return;
    }

    saveBlob(
      new Blob([outputText], {
        type: textMimeTypes[outputFormat],
      }),
      resolvedFileName,
    );
  }

  async function copyOutput() {
    if (!outputText) {
      return;
    }

    try {
      await navigator.clipboard?.writeText(outputText);
      setCopyStatus('已复制结果。');
    } catch {
      setCopyStatus('复制失败，请手动选择结果内容。');
    }
  }

  return (
    <section className="panel output-panel" aria-labelledby="output-title">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">输出</p>
          <h3 id="output-title">转换结果</h3>
        </div>
        <div className="output-actions">
          <Button disabled={!outputText || isExcelOutput} onClick={copyOutput} variant="primary">
            复制
          </Button>
          <Button disabled={!hasOutput} onClick={downloadOutput}>
            下载
          </Button>
        </div>
      </div>

      <div className="output-meta" aria-label="结果信息">
        <span>{outputFormat.toUpperCase()}</span>
        <span>{hasOutput ? `${outputText.length} 字符` : '等待结果'}</span>
        <span>{resolvedFileName}</span>
      </div>

      <textarea
        aria-label="转换结果"
        className={`code-area output-area ${hasOutput ? 'output-area-ready' : ''}`}
        name="output-text"
        placeholder={getEmptyMessage(outputFormat)}
        readOnly
        rows={14}
        spellCheck={false}
        value={outputText}
      />

      {copyStatus || notice ? (
        <p aria-live="polite" className="inline-message inline-message-success output-feedback" style={{ margin: '12px 0 0' }}>
          {copyStatus || notice}
        </p>
      ) : null}
    </section>
  );
}
