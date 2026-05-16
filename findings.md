# 重构发现记录

## 已确认

- 当前转换核心采用 `TableData` 中间模型，方向正确，可以继续沿用。
- 工作台目前只有纵向输入、预览、输出，缺少上传区、选项面板和明确错误反馈。
- 表格编辑器当前只能改单元格，不能改表头、增删行列或清空。
- `csv/json/markdown/html/sql/excel` 解析器和生成器已有测试，可以在此基础上扩展。
- Excel 解析和生成依赖较重，应使用动态导入；完成后首屏 JS 从 251 kB 降到 113 kB。
- Playwright 严格模式下 `getByLabel('转换结果')` 会同时命中 region 和 textarea，测试应使用 `getByRole('textbox', { name: '转换结果' })`。

## 技能选择

- `ui-ux-pro-max`：用于确定工作台信息架构、交互状态和响应式布局。
- `frontend-designer`：用于组件化、可访问性、触控尺寸、设计系统和响应式规则。
- `frontend-design`：用于视觉质感、排版密度和工具站风格。
- `vercel-react-best-practices`：用于控制客户端组件边界、状态派生和性能。
- `playwright-cli` 与 Playwright 测试：用于浏览器验收。
- `web-design-guidelines`：用于最终 UI 审查。

## 子代理审查要点

- UX 审查指出：初始空输入不应显示示例结果；Excel 输入必须真实支持上传；工作台需要从纵向表单改成工具型布局。
- React 审查指出：解析异常必须捕获；输出二进制要避免残留；选项状态应集中管理；表格操作应放到 `lib/table/ops.ts`。
