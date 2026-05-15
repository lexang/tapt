import { expect, test } from '@playwright/test';

test('CSV 转 JSON 可以端到端转换', async ({ page }) => {
  await page.goto('/zh/csv-to-json');
  await page.getByLabel('源数据').fill('name,age\nAda,36');

  await expect(page.getByLabel('转换结果')).toContainText('"Ada"');
});

test('JSON 转 CSV 会按路由格式解析输入', async ({ page }) => {
  await page.goto('/zh/json-to-csv');
  await page.getByLabel('源数据').fill('[{"name":"Lin","age":30}]');

  await expect(page.getByLabel('转换结果')).toHaveValue('name,age\nLin,30');
});
