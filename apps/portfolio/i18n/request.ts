import { getRequestConfig } from 'next-intl/server';
import { getI18nConfig } from '@hstrejoluna/i18n';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@hstrejoluna/i18n';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();
  
  return await getI18nConfig(locale);
});
