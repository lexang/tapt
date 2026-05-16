import { useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import type { ConverterFormat } from '@/lib/converters/catalog';

type SourceFileInfo = {
  name: string;
  size: string;
};

type SourcePanelProps = {
  error?: string;
  fileInfo?: SourceFileInfo;
  inputFormat: ConverterFormat;
  inputHint?: string;
  isReadingFile?: boolean;
  sourceName?: string;
  sourceText: string;
  onFileSelected: (file: File) => void;
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
  error,
  fileInfo,
  inputFormat,
  inputHint,
  isReadingFile = false,
  sourceName,
  sourceText,
  onFileSelected,
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
        <Button onClick={onUseExample} size="sm">
          示例
        </Button>
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

      {error ? (
        <p className="inline-message inline-message-error" role="alert">
          {error}
        </p>
      ) : inputHint ? (
        <p className="inline-message inline-message-success">{inputHint}</p>
      ) : (
        <p className="inline-message">数据只在你的浏览器中处理。</p>
      )}
    </section>
  );
}
