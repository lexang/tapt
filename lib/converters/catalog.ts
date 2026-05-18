import { FORMAT_LABELS, FORMAT_OPTIONS } from '@/lib/converters/formats';

export type ConverterFormat = 'excel' | 'csv' | 'json' | 'markdown' | 'sql' | 'html';

export type ConverterDefinition = {
  id: string;
  slug: string;
  inputFormat: ConverterFormat;
  outputFormat: ConverterFormat;
  title: string;
  description: string;
};

export { FORMAT_LABELS, FORMAT_OPTIONS };

const allFormats: ConverterFormat[] = ['excel', 'csv', 'json', 'markdown', 'sql', 'html'];
const converterPairs: Array<[ConverterFormat, ConverterFormat]> = [];

for (const inputFormat of allFormats) {
  for (const outputFormat of allFormats) {
    if (inputFormat !== outputFormat) {
      converterPairs.push([inputFormat, outputFormat]);
    }
  }
}

export const converterCatalog: ConverterDefinition[] = converterPairs.map(([inputFormat, outputFormat]) => {
  const inputLabel = FORMAT_LABELS[inputFormat];
  const outputLabel = FORMAT_LABELS[outputFormat];
  const slug = `${inputFormat}-to-${outputFormat}`;

  return {
    id: slug,
    slug,
    inputFormat,
    outputFormat,
    title: `${inputLabel} 转 ${outputLabel}`,
    description: `把 ${inputLabel} 表格转换为 ${outputLabel}，可复制结果或下载文件。`,
  };
});
