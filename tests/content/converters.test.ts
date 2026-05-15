import { getConverterBySlug } from '@/content/converters';

describe('converter content', () => {
  it('暴露 Excel 转 JSON 页面内容', () => {
    const page = getConverterBySlug('excel-to-json');
    expect(page.title).toBe('Excel 转 JSON');
    expect(page.description).toContain('EXCEL');
  });
});
