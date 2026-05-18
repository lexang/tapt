import { useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import type { ConverterFormat } from '@/lib/converters/catalog';
import { FORMAT_MODULES } from '@/lib/converters/formats';

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
  formatOptions: ReadonlyArray<{ label: string; value: string }>;
  inputFormat: ConverterFormat;
  inputHint?: string;
  isReadingFile?: boolean;
  sourceText: string;
  onFileSelected: (file: File) => void;
  onInputFormatChange: (value: ConverterFormat) => void;
  onParseAsDetectedFormat?: () => void;
  onSourceTextChange: (value: string) => void;
  onUseExample: () => void;
};

function getPlaceholder(inputFormat: ConverterFormat): string {
  if (inputFormat === 'excel') {
    return '也可以粘贴从 Excel 复制出的表格内容…';
  }

  return `粘贴 ${inputFormat.toUpperCase()} 数据，转换结果会自动更新…`;
}

export function SourcePanel({
  detectedFormat,
  error,
  fileInfo,
  formatOptions,
  inputFormat,
  inputHint,
  isReadingFile = false,
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
          accept={FORMAT_MODULES[inputFormat].accept}
          aria-label="上传文件"
          name="source-file"
          onChange={handleFileChange}
          type="file"
        />
        <span>{isReadingFile ? '正在读取文件…' : '拖入文件，或点击上传'}</span>
        <small>
          {fileInfo
            ? `${fileInfo.name} · ${fileInfo.size}`
            : `支持 ${inputFormat.toUpperCase()} 文件：.${FORMAT_MODULES[inputFormat].extensionAliases.join(' / .')}`}
        </small>
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
