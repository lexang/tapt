import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

type OutputPanelProps = {
  outputText: string;
  outputBinary?: Uint8Array;
  outputFileName?: string;
  prettyJson: boolean;
  showPrettyJson: boolean;
  onPrettyJsonChange: (value: boolean) => void;
};

export function OutputPanel({
  outputText,
  outputBinary,
  outputFileName = 'table.xlsx',
  prettyJson,
  showPrettyJson,
  onPrettyJsonChange,
}: OutputPanelProps) {
  function downloadOutput() {
    if (!outputBinary) {
      return;
    }

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

  return (
    <section aria-labelledby="output-title" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <h2 id="output-title" style={{ margin: 0, fontSize: 18 }}>
            结果
          </h2>
          <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 14 }}>
            复制结果后即可用于接口、文档或数据导入。
          </p>
        </div>
        {outputBinary ? (
          <Button onClick={downloadOutput} variant="primary">
            下载
          </Button>
        ) : (
          <Button
            onClick={() => {
              void navigator.clipboard?.writeText(outputText);
            }}
            variant="primary"
          >
            复制
          </Button>
        )}
      </div>
      {showPrettyJson ? (
        <Toggle label="美化 JSON" checked={prettyJson} onChange={(event) => onPrettyJsonChange(event.target.checked)} />
      ) : null}
      <textarea
        aria-label="转换结果"
        value={outputText}
        readOnly
        rows={12}
        style={{
          width: '100%',
          border: '1px solid #c8d0dc',
          borderRadius: 8,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 14,
          lineHeight: 1.5,
          padding: 12,
          resize: 'vertical',
        }}
      />
    </section>
  );
}
