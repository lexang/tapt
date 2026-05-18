import type { TableData } from '@/lib/table/types';
import type { ConverterFormat } from '@/lib/converters/catalog';
import { parseCsv } from '@/lib/parsers/parse-csv';
import { parseJson } from '@/lib/parsers/parse-json';
import { parseMarkdown } from '@/lib/parsers/parse-markdown';
import { parseHtml } from '@/lib/parsers/parse-html';
import { parseSql } from '@/lib/parsers/parse-sql';
import { generateCsv } from '@/lib/generators/generate-csv';
import { generateJson } from '@/lib/generators/generate-json';
import { generateMarkdown } from '@/lib/generators/generate-markdown';
import { generateHtml } from '@/lib/generators/generate-html';
import { generateSql } from '@/lib/generators/generate-sql';

export type GeneratorOptions = {
  prettyJson: boolean;
  jsonShape: 'array' | 'object';
  csvDelimiter: ',' | ';' | '\t';
  includeCsvHeader: boolean;
  sqlTableName: string;
  includeCreateTable: boolean;
  sqlMultiRowInsert: boolean;
  excelSheetName: string;
};

export type FormatModule = {
  label: string;
  extension: string;
  extensionAliases: readonly string[];
  accept: string;
  textMime?: string;
  binaryMime?: string;
  exampleSource: string;
  parseText: (source: string) => TableData;
  generateText?: (table: TableData, options: GeneratorOptions) => string;
};

const csvExample = 'name,age,role\nAda,36,Engineer\nLin,30,Designer';

export const FORMAT_MODULES: Record<ConverterFormat, FormatModule> = {
  excel: {
    label: 'Excel',
    extension: 'xlsx',
    extensionAliases: ['xlsx', 'xls'],
    accept: '.xlsx,.xls',
    binaryMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    exampleSource: csvExample,
    parseText: parseCsv,
  },
  csv: {
    label: 'CSV',
    extension: 'csv',
    extensionAliases: ['csv', 'tsv', 'txt'],
    accept: '.csv,text/csv',
    textMime: 'text/csv;charset=utf-8',
    exampleSource: csvExample,
    parseText: parseCsv,
    generateText: (table, options) =>
      generateCsv(table, {
        delimiter: options.csvDelimiter,
        includeHeader: options.includeCsvHeader,
      }),
  },
  json: {
    label: 'JSON',
    extension: 'json',
    extensionAliases: ['json'],
    accept: '.json,application/json',
    textMime: 'application/json;charset=utf-8',
    exampleSource:
      '[{"name":"Ada","age":"36","role":"Engineer"},{"name":"Lin","age":"30","role":"Designer"}]',
    parseText: parseJson,
    generateText: (table, options) =>
      generateJson(table, {
        pretty: options.prettyJson,
        shape: options.jsonShape,
      }),
  },
  markdown: {
    label: 'Markdown',
    extension: 'md',
    extensionAliases: ['md', 'markdown'],
    accept: '.md,.markdown,text/markdown',
    textMime: 'text/markdown;charset=utf-8',
    exampleSource: '| name | age | role |\n| --- | --- | --- |\n| Ada | 36 | Engineer |\n| Lin | 30 | Designer |',
    parseText: parseMarkdown,
    generateText: (table) => generateMarkdown(table),
  },
  html: {
    label: 'HTML',
    extension: 'html',
    extensionAliases: ['html', 'htm'],
    accept: '.html,.htm,text/html',
    textMime: 'text/html;charset=utf-8',
    exampleSource:
      '<table><thead><tr><th>name</th><th>age</th><th>role</th></tr></thead><tbody><tr><td>Ada</td><td>36</td><td>Engineer</td></tr><tr><td>Lin</td><td>30</td><td>Designer</td></tr></tbody></table>',
    parseText: parseHtml,
    generateText: (table) => generateHtml(table),
  },
  sql: {
    label: 'SQL',
    extension: 'sql',
    extensionAliases: ['sql'],
    accept: '.sql',
    textMime: 'application/sql;charset=utf-8',
    exampleSource:
      "INSERT INTO `data_table` (`name`, `age`, `role`) VALUES\n  ('Ada', '36', 'Engineer'),\n  ('Lin', '30', 'Designer'),\n  ('Grace', '24', 'Researcher');",
    parseText: parseSql,
    generateText: (table, options) =>
      generateSql(table, {
        tableName: options.sqlTableName,
        includeCreateTable: options.includeCreateTable,
        multiRowInsert: options.sqlMultiRowInsert,
      }),
  },
};

const formatOrder: ConverterFormat[] = ['excel', 'csv', 'json', 'markdown', 'sql', 'html'];

export const FORMAT_LABELS: Record<ConverterFormat, string> = formatOrder.reduce((acc, key) => {
  acc[key] = FORMAT_MODULES[key].label;
  return acc;
}, {} as Record<ConverterFormat, string>);

export const FORMAT_OPTIONS: ReadonlyArray<{ label: string; value: ConverterFormat }> = formatOrder.map((value) => ({
  value,
  label: FORMAT_MODULES[value].label,
}));
