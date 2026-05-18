import type { ConverterFormat } from '@/lib/converters/catalog';
import type { GeneratorOptions } from '@/lib/converters/formats';
import { Select } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';

import Link from 'next/link';

type OptionsPanelProps = {
  formatOptions: ReadonlyArray<{ label: string; value: string }>;
  matchingConverterLink?: { slug: string; title: string };
  options: GeneratorOptions;
  outputFormat: ConverterFormat;
  onOptionsChange: (value: Partial<GeneratorOptions>) => void;
  onOutputFormatChange: (value: ConverterFormat) => void;
};

export function OptionsPanel({
  formatOptions,
  matchingConverterLink,
  options,
  outputFormat,
  onOptionsChange,
  onOutputFormatChange,
}: OptionsPanelProps) {
  return (
    <section className="panel options-panel" aria-labelledby="options-title">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">设置</p>
          <h3 id="options-title">转换选项</h3>
        </div>
      </div>

      <div className="option-stack">
        <Select
          label="输出格式"
          name="output-format"
          onChange={(event) => onOutputFormatChange(event.target.value as ConverterFormat)}
          options={formatOptions}
          value={outputFormat}
        />
        {outputFormat === 'json' ? (
          <>
            <Select
              label="JSON 结构"
              onChange={(event) => onOptionsChange({ jsonShape: event.target.value as 'array' | 'object' })}
              options={[
                { label: '数组', value: 'array' },
                { label: '对象包裹 rows', value: 'object' },
              ]}
              value={options.jsonShape}
            />
            <Toggle
              checked={options.prettyJson}
              label="美化 JSON"
              onChange={(event) => onOptionsChange({ prettyJson: event.target.checked })}
            />
          </>
        ) : null}

        {outputFormat === 'csv' ? (
          <>
            <Select
              label="分隔符"
              onChange={(event) => onOptionsChange({ csvDelimiter: event.target.value as ',' | ';' | '\t' })}
              options={[
                { label: '逗号 ,', value: ',' },
                { label: '分号 ;', value: ';' },
                { label: 'Tab', value: '\t' },
              ]}
              value={options.csvDelimiter}
            />
            <Toggle
              checked={options.includeCsvHeader}
              label="包含表头"
              onChange={(event) => onOptionsChange({ includeCsvHeader: event.target.checked })}
            />
          </>
        ) : null}

        {outputFormat === 'sql' ? (
          <>
            <label className="field">
              <span>表名</span>
              <input
                autoComplete="off"
                className="control"
                name="sql-table-name"
                onChange={(event) => onOptionsChange({ sqlTableName: event.target.value || 'data_table' })}
                value={options.sqlTableName}
              />
            </label>
            <Toggle
              checked={options.includeCreateTable}
              label="包含建表语句"
              onChange={(event) => onOptionsChange({ includeCreateTable: event.target.checked })}
            />
            <Toggle
              checked={options.sqlMultiRowInsert}
              label="合并为单条 INSERT (多元组 VALUES)"
              onChange={(event) => onOptionsChange({ sqlMultiRowInsert: event.target.checked })}
            />
          </>
        ) : null}

      {outputFormat === 'excel' ? (
        <label className="field">
          <span>工作表名称</span>
            <input
              autoComplete="off"
              className="control"
              name="excel-sheet-name"
              onChange={(event) => onOptionsChange({ excelSheetName: event.target.value || 'Sheet1' })}
              value={options.excelSheetName}
            />
          </label>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          {['markdown', 'html'].includes(outputFormat) ? (
            <p className="inline-message">当前格式会按表格内容直接生成结果。</p>
          ) : null}
        </div>
        <div className="format-route-link">
          {matchingConverterLink ? (
            <Link href={`/zh/${matchingConverterLink.slug}`}>打开 {matchingConverterLink.title}</Link>
          ) : (
            <span>当前组合可直接转换。</span>
          )}
        </div>
      </div>
    </section>
  );
}
