import { converterCatalog, type ConverterDefinition } from '@/lib/converters/catalog';

export type ConverterPage = ConverterDefinition & {
  description: string;
  steps: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedSlugs: string[];
};

import { formatWiki } from '@/lib/converters/wiki';

function createPage(converter: ConverterDefinition): ConverterPage {
  const { inputFormat, outputFormat, title } = converter;
  const inputLabel = title.split(' 转 ')[0];
  const outputLabel = title.split(' 转 ')[1];

  const inputWiki = formatWiki[inputFormat];
  const outputWiki = formatWiki[outputFormat];

  return {
    ...converter,
    description: `最安全且免费的在线 ${inputLabel} 转 ${outputLabel} 工具。将您的 ${inputLabel} 数据无缝转换为开发和业务所需的 ${outputLabel} 结构。所有转换均在您的浏览器本地进行，无需上传任何文件。`,
    steps: [
      `粘贴或上传您的 ${inputLabel} 数据，工作台会自动识别并解析。`,
      `在在线表格编辑器中预览并检查数据。如果存在空行、重复行，或需要行列转置，您可以使用上方的清洗工具一键处理。`,
      `调整输出选项，一键复制生成的 ${outputLabel} 结果，或下载为您需要的文件格式。`,
    ],
    faqs: [
      {
        question: `什么是 ${inputLabel} 格式？`,
        answer: inputWiki.definition,
      },
      {
        question: `${outputLabel} 通常适用在什么场景下？`,
        answer: outputWiki.usage,
      },
      {
        question: `在这个工具中，${title} 会上传我的原始数据吗？`,
        answer: '绝对不会。我们的核心优势之一就是极致的数据安全性。转换引擎完全运行在您的浏览器本地环境中，原始数据不会被上传至任何远程服务器。',
      },
      {
        question: '转换后可以直接复制或下载文件吗？',
        answer: '可以。您可以一键将文本结果复制到剪贴板，或者对于支持文件输出的格式（如 Excel、CSV 等），直接下载导出本地文件。',
      },
    ],
    relatedSlugs: converterCatalog
      .filter((item) => item.slug !== converter.slug)
      .filter((item) => item.inputFormat === inputFormat || item.outputFormat === outputFormat)
      .slice(0, 6)
      .map((item) => item.slug),
  };
}

export const converterPages: ConverterPage[] = converterCatalog.map(createPage);

export function getConverterBySlug(slug: string): ConverterPage {
  const page = converterPages.find((converter) => converter.slug === slug);

  if (!page) {
    throw new Error(`未找到转换器：${slug}`);
  }

  return page;
}
