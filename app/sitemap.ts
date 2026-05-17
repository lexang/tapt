import type { MetadataRoute } from 'next';
import { converterPages } from '@/content/converters';

const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE
  ? new Date(process.env.NEXT_PUBLIC_BUILD_DATE)
  : new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    throw new Error('请设置 NEXT_PUBLIC_SITE_URL 后再生成 sitemap。');
  }

  return [
    {
      url: `${baseUrl}/zh`,
      lastModified: BUILD_DATE,
    },
    ...converterPages.map((converter) => ({
      url: `${baseUrl}/zh/${converter.slug}`,
      lastModified: BUILD_DATE,
    })),
  ];
}
