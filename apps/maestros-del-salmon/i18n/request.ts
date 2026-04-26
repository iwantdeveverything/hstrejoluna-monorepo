import { getRequestConfig } from 'next-intl/server';
import { getI18nConfig, resolveLocale } from '@hstrejoluna/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  return await getI18nConfig(resolveLocale(await requestLocale));
});
