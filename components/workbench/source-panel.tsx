import { useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import type { ConverterFormat } from '@/lib/converters/catalog';

type SourceFileInfo = {
  name: string;
  size: string;
};

type DetectedSourceFormat = {
  format: ConverterFormat;
  label: string;
};

type SourcePanelProps = {
  detectedFormat?: DetectedSourceFormat;
  error?: string;
  fileInfo?: SourceFileInfo;
  formatOptions: Array<{ label: string; value: string }>;
  inputFormat: ConverterFormat;
  inputHint?: string;
  isReadingFile?: boolean;
  sourceName?: string;
  sourceText: string;
  onFileSelected: (file: File) => void;
  onInputFormatChange: (value: ConverterFormat) => void;
  onParseAsDetectedFormat?: () => void;
  onSourceTextChange: (value: string) => void;
  onUseExample: () => void;
};

const acceptByFormat: Record<ConverterFormat, string> = {
  excel: '.xlsx,.xls',
  csv: '.csv,text/csv',
  json: '.json,application/json',
  markdown: '.md,.markdown,text/markdown',
  sql: '.sql',
  html: '.html,.htm,text/html',
};

const extensionByFormat: Record<ConverterFormat, string[]> = {
  excel: ['xlsx', 'xls'],
  csv: ['csv', 'tsv', 'txt'],
  json: ['json'],
  markdown: ['md', 'markdown'],
  sql: ['sql'],
  html: ['html', 'htm'],
};

function getPlaceholder(inputFormat: ConverterFormat): string {
  if (inputFormat === 'excel') {
    return '也可以粘贴从 Excel 复制出的表格内容…';
  }

  return `粘贴 ${inputFormat.toUpperCase()} 数据，转换结果会自动更新…`;
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export function SourcePanel({
  detectedFormat,
  error,
  fileInfo,
  formatOptions,
  inputFormat,
  inputHint,
  isReadingFile = false,
  sourceName,
  sourceText,
  onFileSelected,
  onInputFormatChange,
  onParseAsDetectedFormat,
  onSourceTextChange,
  onUseExample,
}: SourcePanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <section className="panel source-panel" aria-labelledby="source-title">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">输入</p>
          <h3 id="source-title">数据源</h3>
        </div>
        <div className="source-panel-heading-actions">
          <label className="field">
            <span>输入格式</span>
            <select
              className="control"
              name="input-format"
              onChange={(event) => onInputFormatChange(event.target.value as ConverterFormat)}
              value={inputFormat}
            >
              {formatOptions.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={onUseExample} size="sm">
            示例
          </Button>
        </div>
      </div>

      <label
        className={['dropzone', isDragging ? 'dropzone-active' : ''].filter(Boolean).join(' ')}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={handleDrop}
      >
        <input
          accept={acceptByFormat[inputFormat]}
          aria-label="上传文件"
          name="source-file"
          onChange={handleFileChange}
          type="file"
        />
        <span>{isReadingFile ? '正在读取文件…' : '拖入文件，或点击上传'}</span>
        <small>
          {fileInfo
            ? `${fileInfo.name} · ${fileInfo.size}`
            : `支持 ${inputFormat.toUpperCase()} 文件：.${extensionByFormat[inputFormat].join(' / .')}`}
        </small>
        {sourceName && !extensionByFormat[inputFormat].includes(getFileExtension(sourceName)) ? (
          <small className="dropzone-warning">文件扩展名和当前格式不完全一致，请确认内容可以转换。</small>
        ) : null}
      </label>

      <label className="field">
        <span>源数据</span>
        <textarea
          aria-label="源数据"
          autoComplete="off"
          className="code-area"
          name="source-text"
          onChange={(event) => onSourceTextChange(event.target.value)}
          placeholder={getPlaceholder(inputFormat)}
          rows={10}
          spellCheck={false}
          value={sourceText}
        />
      </label>

      <div className="source-feedback">
        {detectedFormat ? (
          <div className="format-suggestion">
            <span>这段内容更像 {detectedFormat.label}。</span>
            {onParseAsDetectedFormat ? (
              <Button onClick={onParseAsDetectedFormat} size="sm" variant="ghost">
                按 {detectedFormat.label} 解析
              </Button>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="inline-message inline-message-error" role="alert">
            {error}
          </p>
        ) : inputHint ? (
          <p className="inline-message inline-message-success">{inputHint}</p>
        ) : (
          <p className="inline-message">数据只在你的浏览器中处理。</p>
        )}
      </div>
    </section>
  );
}
