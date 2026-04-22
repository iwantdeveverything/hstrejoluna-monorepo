import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maestrosdelsalmon.com';
  const lastModified = new Date();

  const routes = [
    '',
    '/privacy',
    '/cookies',
    '/legal',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.5,
  }));

  return routes;
}
