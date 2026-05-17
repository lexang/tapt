import type { ConverterFormat } from '@/lib/converters/catalog';

type WikiEntry = {
  definition: string;
  usage: string;
};

export const formatWiki: Record<ConverterFormat, WikiEntry> = {
  excel: {
    definition: 'Excel（通常扩展名为 .xlsx 或 .xls）是由微软开发的电子表格程序数据格式，是全球商业和办公领域使用最广泛的数据存储和分析工具。',
    usage: '适用于复杂的数据计算、财务报表、图表生成以及需要大量格式化外观（如背景色、字体样式）的数据展示场景。由于它是二进制或基于 XML 的专有格式，通常需要专用软件（如 Microsoft Office 或 Windiws 上的 WPS）才能流畅解析。',
  },
  csv: {
    definition: 'CSV（Comma-Separated Values，逗号分隔值）是一种极其轻量且通用的纯文本数据格式。它使用逗号（或分号/制表符）来分隔数据列，使用换行符分隔数据行。',
    usage: '因其结构极其简单且没有任何专有锁定，几乎所有的数据平台、数据库以及编程语言都能轻松导入和导出 CSV。它被广泛用作不同系统间数据传输的“通用语言”。',
  },
  json: {
    definition: 'JSON（JavaScript Object Notation）是一种轻量级的数据交换格式。它基于 JavaScript 对象语法，使用键值对的方式组织数据，不仅机器极易解析和生成，人类也容易阅读。',
    usage: 'JSON 是现代 Web 开发的基石。在前后端 API 通信、NoSQL 数据库（如 MongoDB）存储、甚至各类程序的配置文件中，JSON 都占据了统治地位。对于开发者来说，JSON 格式的数据比传统的表格更具层级表达力。',
  },
  markdown: {
    definition: 'Markdown 是一种轻量级标记语言，允许人们使用易读易写的纯文本格式编写文档，然后无缝转换为 HTML 页面。Markdown 的表格语法使用 | 和 - 来绘制简单的网格。',
    usage: '广泛用于编写软件说明文档（如 README 文件）、个人博客、技术论坛以及像 Notion 这样的现代笔记软件。将数据转换为 Markdown 表格，极大方便了开发者将数据嵌入到说明文档中。',
  },
  html: {
    definition: 'HTML（HyperText Markup Language）是构建网页的标准标记语言。HTML 表格由 <table>、<tr>（行）和 <td>（单元格）等嵌套标签构成，主要用于在网页上结构化展示二维数据。',
    usage: '主要用于网页前端的数据展示。相比其他纯数据格式，HTML 表格的优势在于可以搭配 CSS 赋予极度丰富和个性化的视觉样式（如边框、高亮、悬停效果等）。',
  },
  sql: {
    definition: 'SQL（Structured Query Language）是一种用于管理关系型数据库（如 MySQL、PostgreSQL）的专门编程语言。作为数据格式，通常表现为一系列 `INSERT INTO` 语句。',
    usage: '用于数据库的备份与数据迁移。通过将表格转换为 SQL `INSERT` 语句，开发者可以非常便捷地将外部收集来的数据（如 CSV 或 Excel 调查结果）一键导入到线上的数据库表中。',
  },
};
