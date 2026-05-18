import { parseExcelInWorker, parseTextInWorker } from '@/lib/workbench/parse-client';
import { utils, write } from 'xlsx';

describe('parse-client (jsdom 环境无 Worker,走同步 fallback)', () => {
  it('parseTextInWorker 返回与同步 parser 一致的表', async () => {
    const result = await parseTextInWorker('name,age\nAda,36', 'csv');
    expect(result.columns).toEqual(['name', 'age']);
    expect(result.rows).toHaveLength(1);
  });

  it('parseTextInWorker 在解析失败时 reject', async () => {
    await expect(parseTextInWorker('not-json', 'json')).rejects.toBeInstanceOf(Error);
  });

  it('parseExcelInWorker 走 dynamic import 同步路径,正确读 xlsx buffer', async () => {
    const sheet = utils.aoa_to_sheet([
      ['name', 'age'],
      ['Ada', '36'],
    ]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, sheet, 'Sheet1');
    const buffer = write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    const result = await parseExcelInWorker(buffer);
    expect(result.columns).toEqual(['name', 'age']);
    expect(result.rows).toHaveLength(1);
  });
});
