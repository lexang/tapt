import {
  addColumn,
  addRow,
  clearTable,
  createTableData,
  deleteColumn,
  deleteRow,
  updateCell,
  updateColumn,
  transposeTable,
  deleteEmptyRows,
  deduplicateRows,
  transformCase,
} from '@/lib/table/ops';
import type { ConverterFormat } from '@/lib/converters/catalog';
import { FORMAT_MODULES, type GeneratorOptions } from '@/lib/converters/formats';
import type { TableData } from '@/lib/table/types';

export type WorkbenchState = {
  inputFormat: ConverterFormat;
  outputFormat: ConverterFormat;
  sourceText: string;
  sourceName?: string;
  parsedAsFormat?: ConverterFormat;
  table: TableData;
  outputText: string;
  error?: string;
  notice?: string;
  options: GeneratorOptions;
};

export type WorkbenchAction =
  | { type: 'sourceTextChanged'; value: string }
  | { type: 'sourceTextParsedAs'; inputFormat: ConverterFormat }
  | { type: 'inputFormatChanged'; value: ConverterFormat }
  | { type: 'outputFormatChanged'; value: ConverterFormat }
  | {
      type: 'parsedTableApplied';
      table: TableData;
      notice?: string;
      sourceName?: string;
      sourceText?: string;
    }
  | { type: 'parseFailedForSource'; message: string }
  | { type: 'parseFailed'; message: string; sourceName?: string }
  | { type: 'cellChanged'; rowIndex: number; columnIndex: number; value: string }
  | { type: 'columnChanged'; columnIndex: number; value: string }
  | { type: 'rowAdded' }
  | { type: 'rowDeleted'; rowIndex: number }
  | { type: 'columnAdded' }
  | { type: 'columnDeleted'; columnIndex: number }
  | { type: 'tableCleared' }
  | { type: 'exampleSourceLoaded'; value: string }
  | { type: 'noticeUpdated'; notice?: string }
  | { type: 'optionsChanged'; value: Partial<GeneratorOptions> }
  | { type: 'tableTransposed' }
  | { type: 'emptyRowsDeleted' }
  | { type: 'rowsDeduplicated' }
  | { type: 'caseTransformed'; caseType: 'upper' | 'lower' };

export const emptyTable = createTableData([], []);

export const defaultOptions: GeneratorOptions = {
  prettyJson: true,
  jsonShape: 'array',
  csvDelimiter: ',',
  includeCsvHeader: true,
  sqlTableName: 'data_table',
  includeCreateTable: false,
  sqlMultiRowInsert: false,
  excelSheetName: 'Sheet1',
};

export function hasTableData(table: TableData): boolean {
  return table.columns.length > 0 || table.rows.length > 0;
}

export function parseSourceText(sourceText: string, inputFormat: ConverterFormat): TableData {
  if (sourceText.trim().length === 0) {
    return emptyTable;
  }

  return FORMAT_MODULES[inputFormat].parseText(sourceText);
}

export function getParseErrorMessage(inputFormat: ConverterFormat): string {
  const label = inputFormat.toUpperCase();
  return `请检查 ${label} 数据格式，修正后会自动生成结果。`;
}

function generateOutput(
  table: TableData,
  outputFormat: ConverterFormat,
  options: GeneratorOptions,
): string {
  if (!hasTableData(table)) {
    return '';
  }

  const generate = FORMAT_MODULES[outputFormat].generateText;
  if (generate) {
    return generate(table, options);
  }

  return 'Excel 文件已生成，可以下载使用。';
}

function withGeneratedOutput(
  state: WorkbenchState,
  table: TableData,
  nextState: Partial<WorkbenchState> = {},
): WorkbenchState {
  const outputFormat = nextState.outputFormat ?? state.outputFormat;
  const options = nextState.options ?? state.options;
  return {
    ...state,
    ...nextState,
    table,
    outputText: generateOutput(table, outputFormat, options),
  };
}

export function createInitialState(
  inputFormat: ConverterFormat,
  outputFormat: ConverterFormat,
): WorkbenchState {
  return {
    inputFormat,
    outputFormat,
    sourceText: '',
    table: emptyTable,
    outputText: '',
    options: defaultOptions,
  };
}

export function reducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
  if (action.type === 'sourceTextChanged') {
    return {
      ...state,
      sourceText: action.value,
      sourceName: undefined,
      parsedAsFormat: undefined,
      error: undefined,
    };
  }

  if (action.type === 'sourceTextParsedAs') {
    return {
      ...state,
      inputFormat: action.inputFormat,
      parsedAsFormat: action.inputFormat,
      error: undefined,
    };
  }

  if (action.type === 'inputFormatChanged') {
    return {
      ...state,
      inputFormat: action.value,
      sourceName: undefined,
      parsedAsFormat: undefined,
      error: undefined,
    };
  }

  if (action.type === 'outputFormatChanged') {
    return withGeneratedOutput(state, state.table, {
      outputFormat: action.value,
    });
  }

  if (action.type === 'parsedTableApplied') {
    const next: Partial<WorkbenchState> = {
      error: undefined,
      notice: action.notice,
    };
    if (action.sourceText !== undefined) {
      next.sourceText = action.sourceText;
    }
    if (action.sourceName !== undefined) {
      next.sourceName = action.sourceName;
    }
    return withGeneratedOutput(state, action.table, next);
  }

  if (action.type === 'parseFailedForSource') {
    return {
      ...state,
      table: emptyTable,
      outputText: '',
      error: action.message,
      notice: undefined,
    };
  }

  if (action.type === 'parseFailed') {
    return {
      ...state,
      sourceName: action.sourceName,
      parsedAsFormat: undefined,
      error: action.message,
      notice: undefined,
      outputText: '',
    };
  }

  if (action.type === 'cellChanged') {
    return withGeneratedOutput(state, updateCell(state.table, action.rowIndex, action.columnIndex, action.value), {
      notice: '已更新转换结果。',
    });
  }

  if (action.type === 'columnChanged') {
    return withGeneratedOutput(state, updateColumn(state.table, action.columnIndex, action.value), {
      notice: '已更新字段名称。',
    });
  }

  if (action.type === 'rowAdded') {
    return withGeneratedOutput(state, addRow(state.table), { notice: '已添加一行。' });
  }

  if (action.type === 'rowDeleted') {
    return withGeneratedOutput(state, deleteRow(state.table, action.rowIndex), { notice: '已删除该行。' });
  }

  if (action.type === 'columnAdded') {
    return withGeneratedOutput(state, addColumn(state.table), { notice: '已添加一列。' });
  }

  if (action.type === 'columnDeleted') {
    return withGeneratedOutput(state, deleteColumn(state.table, action.columnIndex), { notice: '已删除该列。' });
  }

  if (action.type === 'tableCleared') {
    return withGeneratedOutput(state, clearTable(), {
      sourceText: '',
      sourceName: undefined,
      parsedAsFormat: undefined,
      error: undefined,
      notice: '已清空表格。',
    });
  }

  if (action.type === 'tableTransposed') {
    return withGeneratedOutput(state, transposeTable(state.table), { notice: '已转置表格。' });
  }

  if (action.type === 'emptyRowsDeleted') {
    return withGeneratedOutput(state, deleteEmptyRows(state.table), { notice: '已删除空行。' });
  }

  if (action.type === 'rowsDeduplicated') {
    return withGeneratedOutput(state, deduplicateRows(state.table), { notice: '已删除重复行。' });
  }

  if (action.type === 'caseTransformed') {
    return withGeneratedOutput(state, transformCase(state.table, action.caseType), { notice: '已转换大小写。' });
  }

  if (action.type === 'exampleSourceLoaded') {
    return {
      ...state,
      sourceText: action.value,
      sourceName: undefined,
      parsedAsFormat: undefined,
      error: undefined,
    };
  }

  if (action.type === 'noticeUpdated') {
    return { ...state, notice: action.notice };
  }

  if (action.type === 'optionsChanged') {
    const options = { ...state.options, ...action.value };
    return withGeneratedOutput(state, state.table, { options, notice: '已按新选项生成结果。' });
  }

  return state;
}
