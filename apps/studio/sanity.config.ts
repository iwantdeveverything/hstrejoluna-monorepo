import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'
import { documentInternationalization } from '@sanity/document-internationalization'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "73v5iufs";
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Portfolio Studio',

  projectId,
  dataset,

  plugins: [
    structureTool(),
    documentInternationalization({
      // Supported languages
      supportedLanguages: [
        { id: 'en', title: 'English' },
        { id: 'es', title: 'Spanish' }
      ],
      // Required for document-level i18n
      schemaTypes: ['profile'],
    })
  ],

  schema: {
    types: schemaTypes,
  },
})
