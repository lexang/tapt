import type { ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import type { ConverterFormat } from '@/lib/converters/catalog';

type SourcePanelProps = {
  error?: string;
  inputFormat: ConverterFormat;
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

function getPlaceholder(inputFormat: ConverterFormat): string {
  if (inputFormat === 'excel') {
    return '也可以粘贴从 Excel 复制出的表格内容…';
  }

  return `粘贴 ${inputFormat.toUpperCase()} 数据，转换结果会自动更新…`;
}

export function SourcePanel({
  error,
  inputFormat,
  sourceName,
  sourceText,
  onFileSelected,
  onSourceTextChange,
  onUseExample,
}: SourcePanelProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
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
        className="dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          accept={acceptByFormat[inputFormat]}
          aria-label="上传文件"
          name="source-file"
          onChange={handleFileChange}
          type="file"
        />
        <span>拖入文件，或点击上传</span>
        <small>{sourceName ? `已选择：${sourceName}` : `支持 ${inputFormat.toUpperCase()} 文件`}</small>
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
      ) : (
        <p className="inline-message">数据只在你的浏览器中处理。</p>
      )}
    </section>
  );
}
