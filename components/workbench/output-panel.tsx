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

export function OutputPanel({
  excelSheetName,
  notice,
  outputText,
  outputFileName = 'table.xlsx',
  outputFormat,
  table,
}: OutputPanelProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const hasOutput = Boolean(outputText);
  const isExcelOutput = outputFormat === 'excel';

  async function downloadOutput() {
    if (!hasOutput) {
      return;
    }

    const { generateExcel } = await import('@/lib/generators/generate-excel');
    const outputBinary = generateExcel(table, { sheetName: excelSheetName });
    const arrayBuffer = outputBinary.buffer.slice(
      outputBinary.byteOffset,
      outputBinary.byteOffset + outputBinary.byteLength,
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputFileName;
    link.click();
    URL.revokeObjectURL(url);
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
        {isExcelOutput ? (
          <Button disabled={!hasOutput} onClick={downloadOutput} variant="primary">
            下载
          </Button>
        ) : (
          <Button disabled={!outputText} onClick={copyOutput} variant="primary">
            复制
          </Button>
        )}
      </div>

      <textarea
        aria-label="转换结果"
        className="code-area output-area"
        name="output-text"
        placeholder={getEmptyMessage(outputFormat)}
        readOnly
        rows={14}
        spellCheck={false}
        value={outputText}
      />

      {copyStatus || notice ? (
        <p aria-live="polite" className="inline-message inline-message-success">
          {copyStatus || notice}
        </p>
      ) : null}
    </section>
  );
}
