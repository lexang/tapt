import { converterCatalog, type ConverterDefinition } from '@/lib/converters/catalog';

export type ConverterPage = ConverterDefinition & {
  description: string;
  steps: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedSlugs: string[];
};

function createPage(converter: ConverterDefinition): ConverterPage {
  const { inputFormat, outputFormat, title } = converter;
  const inputLabel = title.split(' 转 ')[0];
  const outputLabel = title.split(' 转 ')[1];

  return {
    ...converter,
    description: `把 ${inputLabel} 表格转换为 ${outputLabel}。粘贴数据后即可预览、编辑、复制或下载结果。`,
    steps: [
      `粘贴 ${inputLabel} 数据，或使用示例数据查看效果。`,
      '检查表格内容，需要时直接修改单元格。',
      `复制生成的 ${outputLabel} 结果，或下载可用文件。`,
    ],
    faqs: [
      {
        question: `${title} 会上传我的数据吗？`,
        answer: '不会。转换在你的浏览器中完成，数据不会因为转换而上传到服务器。',
      },
      {
        question: '转换结果可以直接使用吗？',
        answer: '可以。你可以复制文本结果，或在支持文件输出的格式中下载文件。',
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
