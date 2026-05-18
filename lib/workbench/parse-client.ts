import type { ConverterFormat } from '@/lib/converters/catalog';
import { FORMAT_MODULES } from '@/lib/converters/formats';
import type { TableData } from '@/lib/table/types';
import type { WorkerRequest, WorkerResponse } from '@/lib/workbench/parse-worker';

type Pending = {
  resolve: (table: TableData) => void;
  reject: (err: Error) => void;
};

let worker: Worker | null = null;
let workerUnavailable = false;
let nextId = 0;
const pending = new Map<number, Pending>();

function getWorker(): Worker | null {
  if (workerUnavailable) {
    return null;
  }
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    workerUnavailable = true;
    return null;
  }
  if (worker) {
    return worker;
  }
  try {
    worker = new Worker(new URL('./parse-worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      const handler = pending.get(msg.id);
      if (!handler) {
        return;
      }
      pending.delete(msg.id);
      if (msg.ok) {
        handler.resolve(msg.table);
      } else {
        handler.reject(new Error(msg.message));
      }
    };
    worker.onerror = (event) => {
      const err = new Error(event.message || 'Worker 异常');
      for (const handler of pending.values()) {
        handler.reject(err);
      }
      pending.clear();
    };
    return worker;
  } catch {
    workerUnavailable = true;
    return null;
  }
}

function syncParseText(sourceText: string, inputFormat: ConverterFormat): TableData {
  return FORMAT_MODULES[inputFormat].parseText(sourceText);
}

export function parseTextInWorker(sourceText: string, inputFormat: ConverterFormat): Promise<TableData> {
  const w = getWorker();
  if (!w) {
    try {
      return Promise.resolve(syncParseText(sourceText, inputFormat));
    } catch (err) {
      return Promise.reject(err instanceof Error ? err : new Error('解析失败'));
    }
  }
  return new Promise<TableData>((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    const req: WorkerRequest = { id, kind: 'text', sourceText, inputFormat };
    w.postMessage(req);
  });
}

export async function parseExcelInWorker(buffer: ArrayBuffer): Promise<TableData> {
  const w = getWorker();
  if (!w) {
    const { parseExcel } = await import('@/lib/parsers/parse-excel');
    return parseExcel(buffer);
  }
  return new Promise<TableData>((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    const req: WorkerRequest = { id, kind: 'binary', buffer };
    w.postMessage(req, [buffer]);
  });
}

export function terminateParseWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  for (const handler of pending.values()) {
    handler.reject(new Error('worker terminated'));
  }
  pending.clear();
}
