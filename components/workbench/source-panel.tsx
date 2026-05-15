import { Button } from '@/components/ui/button';

type SourcePanelProps = {
  sourceText: string;
  onSourceTextChange: (value: string) => void;
  onUseExample: () => void;
};

export function SourcePanel({ sourceText, onSourceTextChange, onUseExample }: SourcePanelProps) {
  return (
    <section aria-labelledby="source-title" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <h2 id="source-title" style={{ margin: 0, fontSize: 18 }}>
            数据源
          </h2>
          <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 14 }}>
            粘贴表格数据，或先使用示例查看转换效果。
          </p>
        </div>
        <Button onClick={onUseExample}>示例</Button>
      </div>
      <textarea
        aria-label="源数据"
        value={sourceText}
        onChange={(event) => onSourceTextChange(event.target.value)}
        rows={7}
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
