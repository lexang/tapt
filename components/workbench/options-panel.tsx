import type { ConverterFormat } from '@/lib/converters/catalog';
import { Select } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';

type GeneratorOptions = {
  prettyJson: boolean;
  jsonShape: 'array' | 'object';
  csvDelimiter: ',' | ';' | '\t';
  includeCsvHeader: boolean;
  sqlTableName: string;
  includeCreateTable: boolean;
  excelSheetName: string;
};

type OptionsPanelProps = {
  options: GeneratorOptions;
  outputFormat: ConverterFormat;
  onOptionsChange: (value: Partial<GeneratorOptions>) => void;
};

export function OptionsPanel({ options, outputFormat, onOptionsChange }: OptionsPanelProps) {
  return (
    <section className="panel options-panel" aria-labelledby="options-title">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">设置</p>
          <h3 id="options-title">转换选项</h3>
        </div>
      </div>

      {outputFormat === 'json' ? (
        <div className="option-stack">
          <Toggle
            checked={options.prettyJson}
            label="美化 JSON"
            onChange={(event) => onOptionsChange({ prettyJson: event.target.checked })}
          />
          <Select
            label="JSON 结构"
            onChange={(event) => onOptionsChange({ jsonShape: event.target.value as 'array' | 'object' })}
            options={[
              { label: '数组', value: 'array' },
              { label: '对象包裹 rows', value: 'object' },
            ]}
            value={options.jsonShape}
          />
        </div>
      ) : null}

      {outputFormat === 'csv' ? (
        <div className="option-stack">
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
        </div>
      ) : null}

      {outputFormat === 'sql' ? (
        <div className="option-stack">
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
        </div>
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

      {['markdown', 'html'].includes(outputFormat) ? (
        <p className="inline-message">当前格式会按表格内容直接生成结果。</p>
      ) : null}
    </section>
  );
}
