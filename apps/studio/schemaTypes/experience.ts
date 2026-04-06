import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      options: { dateFormat: 'YYYY-MM' }
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
      options: { dateFormat: 'YYYY-MM' },
      hidden: ({ document }) => !!document?.isCurrent,
      validation: (Rule) =>
        Rule.custom((endDate, context) => {
          const { document } = context
          if (!endDate || !document?.startDate) return true
          return new Date(endDate) >= new Date(document.startDate as string)
            ? true
            : 'End date must be after start date'
        }),
    }),
    defineField({
      name: 'isCurrent',
      title: 'Currently Working Here',
      type: 'boolean',
    }),
    defineField({
      name: 'description',
      title: 'Description / Achievements',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: {
      title: 'role',
      subtitle: 'company',
    }
  }
})
