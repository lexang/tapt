export type ConverterFormat = 'excel' | 'csv' | 'json' | 'markdown' | 'sql' | 'html';

export type ConverterDefinition = {
  id: string;
  slug: string;
  inputFormat: ConverterFormat;
  outputFormat: ConverterFormat;
  title: string;
  description: string;
};

const formatLabels: Record<ConverterFormat, string> = {
  excel: 'Excel',
  csv: 'CSV',
  json: 'JSON',
  markdown: 'Markdown',
  sql: 'SQL',
  html: 'HTML',
};

const converterPairs: Array<[ConverterFormat, ConverterFormat]> = [
  ['excel', 'json'],
  ['excel', 'csv'],
  ['excel', 'markdown'],
  ['excel', 'sql'],
  ['csv', 'json'],
  ['csv', 'markdown'],
  ['csv', 'sql'],
  ['json', 'csv'],
  ['json', 'excel'],
  ['json', 'markdown'],
  ['markdown', 'csv'],
  ['markdown', 'json'],
  ['html', 'csv'],
  ['html', 'json'],
];

export const converterCatalog: ConverterDefinition[] = converterPairs.map(([inputFormat, outputFormat]) => {
  const inputLabel = formatLabels[inputFormat];
  const outputLabel = formatLabels[outputFormat];
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
