import { defineField, defineType } from 'sanity'
import { locales } from '@hstrejoluna/i18n'

/**
 * Shared localized string object for field-level i18n
 */
export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  fields: locales.map((locale) =>
    defineField({
      name: locale,
      title: locale === 'en' ? 'English' : locale === 'es' ? 'Spanish' : locale.toUpperCase(),
      type: 'string',
    })
  ),
})

/**
 * Shared localized block content for field-level i18n
 */
export const localizedBlock = defineType({
  name: 'localizedBlock',
  title: 'Localized Block',
  type: 'object',
  fields: locales.map((locale) =>
    defineField({
      name: locale,
      title: locale === 'en' ? 'English' : locale === 'es' ? 'Spanish' : locale.toUpperCase(),
      type: 'array',
      of: [{ type: 'block' }],
    })
  ),
})
