import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

type OutputPanelProps = {
  outputText: string;
  prettyJson: boolean;
  onPrettyJsonChange: (value: boolean) => void;
};

export function OutputPanel({ outputText, prettyJson, onPrettyJsonChange }: OutputPanelProps) {
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
        <Button
          onClick={() => {
            void navigator.clipboard?.writeText(outputText);
          }}
          variant="primary"
        >
          复制
        </Button>
      </div>
      <Toggle label="美化 JSON" checked={prettyJson} onChange={(event) => onPrettyJsonChange(event.target.checked)} />
      <textarea
        aria-label="结果"
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
