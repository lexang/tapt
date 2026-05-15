import type { MetadataRoute } from 'next';
import { converterPages } from '@/content/converters';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

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
