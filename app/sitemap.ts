import type { MetadataRoute } from 'next';
import { converterPages } from '@/content/converters';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://example.com';

  return [
    {
      url: `${baseUrl}/zh`,
      lastModified: new Date(),
    },
    ...converterPages.map((converter) => ({
      url: `${baseUrl}/zh/${converter.slug}`,
      lastModified: new Date(),
    })),
  ];
}
