import type { MetadataRoute } from 'next';
import { routing } from '../i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hstrejoluna.com';
  const lastModified = new Date();

  const locales = routing.locales;
  const paths = ['', '/privacy', '/cookies', '/legal'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    paths.forEach((path) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: path === '' ? 1 : 0.5,
      });
    });
  });

  return sitemapEntries;
}
