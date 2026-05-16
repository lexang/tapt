import { expect, test } from '@playwright/test';

test('CSV 转 JSON 可以端到端转换', async ({ page }) => {
  await page.goto('/zh/csv-to-json');
  await page.getByLabel('源数据').fill('name,age\nAda,36');

  await expect(page.getByRole('textbox', { name: '转换结果' })).toContainText('"Ada"');
});

test('JSON 转 CSV 会按路由格式解析输入', async ({ page }) => {
  await page.goto('/zh/json-to-csv');
  await page.getByLabel('源数据').fill('[{"name":"Lin","age":30}]');

  await expect(page.getByRole('textbox', { name: '转换结果' })).toHaveValue('name,age\nLin,30');
});

test('非法 JSON 会显示错误且不白屏', async ({ page }) => {
  await page.goto('/zh/json-to-csv');
  await page.getByLabel('源数据').fill('[{"name":]');

  await expect(page.getByText('请检查 JSON 数据格式，修正后会自动生成结果。')).toBeVisible();
  await expect(page.getByRole('heading', { name: '表格编辑' })).toBeVisible();
});

test('编辑预览表格后输出会更新', async ({ page }) => {
  await page.goto('/zh/csv-to-json');
  await page.getByLabel('源数据').fill('name,age\nAda,36');
  await page.getByLabel('name 第 1 行').fill('Lin');

  await expect(page.getByRole('textbox', { name: '转换结果' })).toContainText('"Lin"');
});
