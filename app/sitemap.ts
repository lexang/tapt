import type { MetadataRoute } from 'next';
import { converterPages } from '@/content/converters';

function resolveBuildDate(): Date {
  const raw = process.env.NEXT_PUBLIC_BUILD_DATE;
  if (!raw) {
    throw new Error('请设置 NEXT_PUBLIC_BUILD_DATE 后再生成 sitemap,避免 lastModified 随构建漂移。');
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`NEXT_PUBLIC_BUILD_DATE 不是合法日期:${raw}`);
  }
  return parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    throw new Error('请设置 NEXT_PUBLIC_SITE_URL 后再生成 sitemap。');
  }

  const buildDate = resolveBuildDate();

  return [
    {
      url: `${baseUrl}/zh`,
      lastModified: buildDate,
    },
    ...converterPages.map((converter) => ({
      url: `${baseUrl}/zh/${converter.slug}`,
      lastModified: buildDate,
    })),
  ];
}
