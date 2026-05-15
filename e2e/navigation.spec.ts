import { expect, test } from '@playwright/test';

test('转换页展示标题、步骤和常见问题', async ({ page }) => {
  await page.goto('/zh/excel-to-json');

  await expect(page.getByRole('heading', { name: 'Excel 转 JSON', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: '如何使用 Excel 转 JSON' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '常见问题' })).toBeVisible();
});
