import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'socials',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          preview: {
            select: {
              platform: 'platform',
              label: 'label',
              email: 'email',
              url: 'url',
            },
            prepare({
              platform,
              label,
              email,
              url,
            }: {
              platform?: string;
              label?: string;
              email?: string;
              url?: string;
            }) {
              const subtitle = label ?? (platform === 'email' ? email : url) ?? 'Missing destination';

              return {
                title: platform ? platform.toUpperCase() : 'UNKNOWN',
                subtitle,
              };
            },
          },
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              validation: (rule) => rule.required(),
              options: {
                list: [
                  { title: 'GitHub', value: 'github' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'Email', value: 'email' },
                ],
              },
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              hidden: ({ parent }) => parent?.platform === 'email',
              validation: (rule) =>
                rule.custom((value, context) => {
                  const platform = (context.parent as { platform?: string } | undefined)?.platform;
                  if (platform === 'email') {
                    return true;
                  }

                  return value ? true : 'URL is required for GitHub and LinkedIn.';
                }),
            }),
            defineField({
              name: 'email',
              title: 'Email (plain text)',
              type: 'string',
              hidden: ({ parent }) => parent?.platform !== 'email',
              validation: (rule) =>
                rule.custom((value, context) => {
                  const platform = (context.parent as { platform?: string } | undefined)?.platform;
                  if (platform !== 'email') {
                    return true;
                  }

                  if (!value) {
                    return 'Email is required when platform is email.';
                  }

                  return /\S+@\S+\.\S+/.test(value) ? true : 'Email must be valid.';
                }),
            }),
            defineField({
              name: 'label',
              title: 'Accessible Label',
              type: 'string',
              description: 'Used as accessible text in navigation (optional).',
            }),
            defineField({
              name: 'order',
              title: 'Order',
              type: 'number',
              description: 'Lower numbers appear first in navigation.',
            }),
          ],
        },
      ],
    }),
  ],
})
