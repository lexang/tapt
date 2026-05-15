# 中文表格转换工具站第一版实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个中文在线表格转换站，支持本地浏览器内完成常用格式互转、表格编辑、结果复制/下载，并提供可收录的独立转换页。

**Architecture:** 使用 Next.js App Router 承载首页、转换页和 SEO 页面；`lib/` 中放统一表格模型、解析器和生成器；`components/` 只负责 UI 与状态编排。所有转换都先归一到同一份表格数据，再按目标格式输出，便于测试和扩展。

**Tech Stack:** Next.js 15、React 19、TypeScript、CSS Modules、Vitest、React Testing Library、Playwright、`xlsx`、`papaparse`。

---

## 文件结构

- 创建：`package.json`、`tsconfig.json`、`next.config.mjs`、`vitest.config.ts`、`playwright.config.ts`
- 创建：`app/layout.tsx`、`app/page.tsx`、`app/globals.css`、`app/robots.ts`、`app/sitemap.ts`
- 创建：`app/zh/page.tsx`、`app/zh/[slug]/page.tsx`
- 创建：`components/home/home-page.tsx`
- 创建：`components/workbench/converter-workbench.tsx`、`components/workbench/source-panel.tsx`、`components/workbench/editor-panel.tsx`、`components/workbench/output-panel.tsx`
- 创建：`components/table-editor/table-editor.tsx`、`components/table-editor/table-grid.tsx`
- 创建：`components/ui/button.tsx`、`components/ui/select.tsx`、`components/ui/toggle.tsx`
- 创建：`content/converters.ts`
- 创建：`lib/table/types.ts`、`lib/table/ops.ts`
- 创建：`lib/parsers/parse-csv.ts`、`lib/parsers/parse-json.ts`、`lib/parsers/parse-markdown.ts`、`lib/parsers/parse-html.ts`、`lib/parsers/parse-excel.ts`、`lib/parsers/parse-sql.ts`
- 创建：`lib/generators/generate-csv.ts`、`lib/generators/generate-json.ts`、`lib/generators/generate-markdown.ts`、`lib/generators/generate-html.ts`、`lib/generators/generate-sql.ts`、`lib/generators/generate-excel.ts`
- 创建：`lib/converters/catalog.ts`、`lib/converters/resolve-converter.ts`
- 创建：`tests/smoke/home-page.test.tsx`、`tests/lib/parsers/*.test.ts`、`tests/lib/generators/*.test.ts`、`tests/components/workbench.test.tsx`、`tests/content/converters.test.ts`
- 创建：`e2e/conversion.spec.ts`、`e2e/navigation.spec.ts`

## 预检

- [ ] 执行 `git status --short`
- [ ] 如果输出 `fatal: not a git repository`，先申请批准，把空的 `.git` 目录初始化成有效仓库
- [ ] Git 可用后，先提交文档：

```bash
git add docs
git commit -m "docs: add table converter research and design"
```

## 任务 1：搭建项目骨架和测试环境

**文件：**
- 创建：`package.json`
- 创建：`tsconfig.json`
- 创建：`next.config.mjs`
- 创建：`vitest.config.ts`
- 创建：`app/layout.tsx`
- 创建：`app/page.tsx`
- 创建：`app/globals.css`
- 创建：`components/home/home-page.tsx`
- 创建：`tests/smoke/home-page.test.tsx`

- [ ] **步骤 1：先写失败测试**

```tsx
import { render, screen } from '@testing-library/react';
import { HomePage } from '@/components/home/home-page';

describe('HomePage', () => {
  it('显示主转换入口', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: '表格转换工具' })).toBeTruthy();
    expect(screen.getByText('粘贴、上传、编辑并转换表格数据')).toBeTruthy();
  });
});
```

- [ ] **步骤 2：运行测试，确认失败**

运行：

```bash
npx vitest run tests/smoke/home-page.test.tsx
```

预期：失败，因为 `components/home/home-page.tsx` 还不存在。

- [ ] **步骤 3：实现最小页面骨架**

把 `HomePage` 做成纯组件，再让 `app/page.tsx` 引用它，`app/layout.tsx` 只提供最基础的全局壳。

```tsx
export function HomePage() {
  return (
    <main>
      <h1>表格转换工具</h1>
      <p>粘贴、上传、编辑并转换表格数据</p>
    </main>
  );
}
```

- [ ] **步骤 4：再次运行测试和构建**

运行：

```bash
npx vitest run tests/smoke/home-page.test.tsx
npm run build
```

预期：都通过。

- [ ] **步骤 5：提交**

```bash
git add package.json tsconfig.json next.config.mjs vitest.config.ts app components tests
git commit -m "feat: scaffold table converter site"
```

## 任务 2：建立统一表格模型，并实现 CSV / JSON 解析

**文件：**
- 创建：`lib/table/types.ts`
- 创建：`lib/table/ops.ts`
- 创建：`lib/parsers/parse-csv.ts`
- 创建：`lib/parsers/parse-json.ts`
- 创建：`tests/lib/parsers/parse-csv.test.ts`
- 创建：`tests/lib/parsers/parse-json.test.ts`

- [ ] **步骤 1：写失败测试**

```ts
import { parseCsv } from '@/lib/parsers/parse-csv';
import { parseJson } from '@/lib/parsers/parse-json';

describe('parseCsv', () => {
  it('把首行作为表头', () => {
    expect(parseCsv('name,age\nAda,36')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});

describe('parseJson', () => {
  it('把对象数组映射成表格', () => {
    expect(parseJson('[{"name":"Ada","age":36}]')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});
```

- [ ] **步骤 2：运行测试，确认失败**

运行：

```bash
npx vitest run tests/lib/parsers/parse-csv.test.ts tests/lib/parsers/parse-json.test.ts
```

预期：失败，因为解析器和表格类型还没写。

- [ ] **步骤 3：实现最小模型和解析器**

统一表格模型：

```ts
export type TableCell = { value: string };
export type TableData = {
  columns: string[];
  rows: TableCell[][];
};
```

CSV 和 JSON 先只支持最常见的输入形态，保证第一批转换稳定。

- [ ] **步骤 4：再次运行测试**

运行：

```bash
npx vitest run tests/lib/parsers/parse-csv.test.ts tests/lib/parsers/parse-json.test.ts
```

预期：通过。

- [ ] **步骤 5：提交**

```bash
git add lib tests
git commit -m "feat: add csv and json parsing"
```

## 任务 3：补齐 Markdown、HTML、Excel、SQL 解析

**文件：**
- 创建：`lib/parsers/parse-markdown.ts`
- 创建：`lib/parsers/parse-html.ts`
- 创建：`lib/parsers/parse-excel.ts`
- 创建：`lib/parsers/parse-sql.ts`
- 创建：`tests/lib/parsers/parse-markdown.test.ts`
- 创建：`tests/lib/parsers/parse-html.test.ts`
- 创建：`tests/lib/parsers/parse-excel.test.ts`
- 创建：`tests/lib/parsers/parse-sql.test.ts`

- [ ] **步骤 1：写失败测试**

```ts
import { parseMarkdown } from '@/lib/parsers/parse-markdown';
import { parseHtml } from '@/lib/parsers/parse-html';
import { parseExcel } from '@/lib/parsers/parse-excel';
import { parseSql } from '@/lib/parsers/parse-sql';
import { utils, write } from 'xlsx';

describe('parseMarkdown', () => {
  it('读取 markdown 表格', () => {
    expect(parseMarkdown('| name | age |\n| --- | --- |\n| Ada | 36 |')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});

describe('parseHtml', () => {
  it('读取第一个 HTML 表格', () => {
    expect(parseHtml('<table><tr><th>name</th><th>age</th></tr><tr><td>Ada</td><td>36</td></tr></table>')).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});

describe('parseExcel', () => {
  it('读取工作簿第一张表', () => {
    const sheet = utils.aoa_to_sheet([
      ['name', 'age'],
      ['Ada', 36],
    ]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, sheet, 'Sheet1');
    const buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });

    expect(parseExcel(buffer)).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});

describe('parseSql', () => {
  it('读取简单 INSERT 语句中的值', () => {
    expect(parseSql("INSERT INTO users (name, age) VALUES ('Ada', 36);")).toEqual({
      columns: ['name', 'age'],
      rows: [[{ value: 'Ada' }, { value: '36' }]],
    });
  });
});
```

- [ ] **步骤 2：运行测试，确认失败**

运行：

```bash
npx vitest run tests/lib/parsers/parse-markdown.test.ts tests/lib/parsers/parse-html.test.ts tests/lib/parsers/parse-excel.test.ts tests/lib/parsers/parse-sql.test.ts
```

预期：失败，因为这些解析器还没实现。

- [ ] **步骤 3：实现最小解析器**

Markdown 和 HTML 只支持常见表格结构；SQL 先只支持简单 `INSERT INTO ... VALUES ...`；Excel 读取第一张工作表并把单元格统一转成字符串。

- [ ] **步骤 4：再次运行测试**

运行：

```bash
npx vitest run tests/lib/parsers/parse-markdown.test.ts tests/lib/parsers/parse-html.test.ts tests/lib/parsers/parse-excel.test.ts tests/lib/parsers/parse-sql.test.ts
```

预期：通过。

- [ ] **步骤 5：提交**

```bash
git add lib tests
git commit -m "feat: add markdown html excel and sql parsing"
```

## 任务 4：实现生成器和转换器目录

**文件：**
- 创建：`lib/generators/generate-csv.ts`
- 创建：`lib/generators/generate-json.ts`
- 创建：`lib/generators/generate-markdown.ts`
- 创建：`lib/generators/generate-html.ts`
- 创建：`lib/generators/generate-sql.ts`
- 创建：`lib/generators/generate-excel.ts`
- 创建：`lib/converters/catalog.ts`
- 创建：`lib/converters/resolve-converter.ts`
- 创建：`tests/lib/generators/generate-csv.test.ts`
- 创建：`tests/lib/generators/generate-json.test.ts`
- 创建：`tests/lib/generators/generate-markdown.test.ts`
- 创建：`tests/lib/generators/generate-html.test.ts`
- 创建：`tests/lib/generators/generate-sql.test.ts`
- 创建：`tests/lib/generators/generate-excel.test.ts`

- [ ] **步骤 1：写失败测试**

```ts
import { generateJson } from '@/lib/generators/generate-json';
import { generateMarkdown } from '@/lib/generators/generate-markdown';

const table = {
  columns: ['name', 'age'],
  rows: [[{ value: 'Ada' }, { value: '36' }]],
};

describe('generateJson', () => {
  it('输出美化 JSON', () => {
    expect(generateJson(table, { pretty: true })).toBe('[\n  {\n    "name": "Ada",\n    "age": "36"\n  }\n]');
  });
});

describe('generateMarkdown', () => {
  it('输出 markdown 表格', () => {
    expect(generateMarkdown(table)).toBe('| name | age |\n| --- | --- |\n| Ada | 36 |');
  });
});
```

- [ ] **步骤 2：运行测试，确认失败**

运行：

```bash
npx vitest run tests/lib/generators/*.test.ts
```

预期：失败，因为生成器还没实现。

- [ ] **步骤 3：实现各格式生成器和目录**

每种输出格式单独一个生成器；再在 `lib/converters/catalog.ts` 中把“输入格式 + 输出格式 + 页面文案 + 选项”串起来。

- [ ] **步骤 4：再次运行测试**

运行：

```bash
npx vitest run tests/lib/generators/*.test.ts
```

预期：通过。

- [ ] **步骤 5：提交**

```bash
git add lib tests
git commit -m "feat: add output generators and converter catalog"
```

## 任务 5：搭建转换工作台 UI

**文件：**
- 创建：`components/workbench/converter-workbench.tsx`
- 创建：`components/workbench/source-panel.tsx`
- 创建：`components/workbench/editor-panel.tsx`
- 创建：`components/workbench/output-panel.tsx`
- 创建：`components/table-editor/table-editor.tsx`
- 创建：`components/table-editor/table-grid.tsx`
- 创建：`components/ui/button.tsx`
- 创建：`components/ui/select.tsx`
- 创建：`components/ui/toggle.tsx`
- 创建：`tests/components/workbench.test.tsx`

- [ ] **步骤 1：写失败测试**

```tsx
import { render, screen } from '@testing-library/react';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';

describe('ConverterWorkbench', () => {
  it('源数据变化时更新结果', () => {
    render(<ConverterWorkbench initialConverterId="excel-to-json" />);

    expect(screen.getByText('结果')).toBeTruthy();
    expect(screen.getByDisplayValue(/Ada/)).toBeTruthy();
  });
});
```

- [ ] **步骤 2：运行测试，确认失败**

运行：

```bash
npx vitest run tests/components/workbench.test.tsx
```

预期：失败，因为工作台组件还没实现。

- [ ] **步骤 3：实现单状态工作台**

把输入格式、输出格式、表格数据、输出结果和选项放在一个 reducer 里，三块面板共享这份状态，保证修改后实时更新。

```ts
type WorkbenchState = {
  inputFormat: ConverterInputFormat;
  outputFormat: ConverterOutputFormat;
  table: TableData;
  outputText: string;
  options: Record<string, string | boolean>;
};
```

- [ ] **步骤 4：再次运行测试**

运行：

```bash
npx vitest run tests/components/workbench.test.tsx
```

预期：通过。

- [ ] **步骤 5：提交**

```bash
git add components tests
git commit -m "feat: build converter workbench"
```

## 任务 6：接入路由页、SEO 文案和静态内容

**文件：**
- 创建：`content/converters.ts`
- 创建：`app/zh/page.tsx`
- 创建：`app/zh/[slug]/page.tsx`
- 修改：`app/page.tsx`
- 修改：`app/layout.tsx`
- 创建：`app/robots.ts`
- 创建：`app/sitemap.ts`
- 创建：`tests/content/converters.test.ts`

- [ ] **步骤 1：写失败测试**

```ts
import { getConverterBySlug } from '@/content/converters';

describe('converter content', () => {
  it('暴露 Excel 转 JSON 页面内容', () => {
    const page = getConverterBySlug('excel-to-json');
    expect(page.title).toBe('Excel 转 JSON');
    expect(page.description).toContain('Excel');
  });
});
```

- [ ] **步骤 2：运行测试，确认失败**

运行：

```bash
npx vitest run tests/content/converters.test.ts
```

预期：失败，因为内容目录还没实现。

- [ ] **步骤 3：实现内容目录和静态页面**

把每个转换页的标题、说明、FAQ、相关链接、示例文案放在 `content/converters.ts`，再由 `/zh/[slug]` 渲染。

- [ ] **步骤 4：运行构建**

运行：

```bash
npm run build
```

预期：通过，并能静态生成这些页面。

- [ ] **步骤 5：提交**

```bash
git add app content tests
git commit -m "feat: add seo converter pages"
```

## 任务 7：补端到端测试和最后细节

**文件：**
- 创建：`playwright.config.ts`
- 创建：`e2e/conversion.spec.ts`
- 创建：`e2e/navigation.spec.ts`

- [ ] **步骤 1：写失败的 e2e 测试**

```ts
import { test, expect } from '@playwright/test';

test('excel to json conversion works end to end', async ({ page }) => {
  await page.goto('/zh/excel-to-json');
  await page.getByRole('textbox').fill('name,age\nAda,36');
  await expect(page.getByRole('textbox', { name: '结果' })).toContainText('"Ada"');
});
```

- [ ] **步骤 2：运行测试，确认失败**

运行：

```bash
npx playwright test e2e/conversion.spec.ts
```

预期：失败，因为页面和转换链路还没完全打通。

- [ ] **步骤 3：补齐最后的 UI 细节**

把空状态、加载状态、中文错误提示、复制反馈、下载反馈、键盘可用性和响应式布局补完整。

- [ ] **步骤 4：跑完整验证**

运行：

```bash
npx vitest run
npx playwright test
npm run build
```

预期：全部通过。

- [ ] **步骤 5：提交**

```bash
git add app components content e2e lib tests
git commit -m "feat: finish table converter site"
```

## 自检清单

- [ ] 规格里提到的格式，都能在某个解析器或生成器任务里找到对应实现。
- [ ] 规格里提到的公开路由，都有对应任务创建。
- [ ] 每个任务都写了文件清单、失败测试、运行命令和提交步骤。
- [ ] 没有使用含糊、延后式、占位式表述。

