import type { ConverterFormat } from '@/lib/converters/catalog';
import { FORMAT_MODULES } from '@/lib/converters/formats';
import { parseExcel } from '@/lib/parsers/parse-excel';
import type { TableData } from '@/lib/table/types';

export type WorkerRequest =
  | { id: number; kind: 'text'; sourceText: string; inputFormat: ConverterFormat }
  | { id: number; kind: 'binary'; buffer: ArrayBuffer };

export type WorkerResponse =
  | { id: number; ok: true; table: TableData }
  | { id: number; ok: false; message: string };

function parseText(sourceText: string, inputFormat: ConverterFormat): TableData {
  return FORMAT_MODULES[inputFormat].parseText(sourceText);
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  try {
    const table = req.kind === 'text' ? parseText(req.sourceText, req.inputFormat) : parseExcel(req.buffer);
    const response: WorkerResponse = { id: req.id, ok: true, table };
    (self as unknown as Worker).postMessage(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : '解析失败';
    const response: WorkerResponse = { id: req.id, ok: false, message };
    (self as unknown as Worker).postMessage(response);
  }
};
