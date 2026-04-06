import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'skill',
  title: 'Skill',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Skill Name',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Frontend', value: 'frontend' },
          { title: 'Backend', value: 'backend' },
          { title: 'Tools & DevOps', value: 'tools' },
          { title: 'Tracking & Analytics', value: 'analytics' },
          { title: 'Design', value: 'design' },
        ]
      }
    }),
    defineField({
      name: 'proficiency',
      title: 'Proficiency (1-100)',
      type: 'number',
      validation: Rule => Rule.min(1).max(100)
    }),
  ],
})
