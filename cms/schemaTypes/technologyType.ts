import { defineField, defineType } from 'sanity';

export const technologyType = defineType({
  name: 'technology',
  title: 'Technology & Tool',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g. Cloudflare Workers, Durable Objects, GLM-4.7-Flash, Notion API, Python',
      validation: (rule) => rule.required().min(2).max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 60,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Runtime & Edge Infrastructure', value: 'runtime' },
          { title: 'AI Model / LLM Engine', value: 'model' },
          { title: 'State & Database Storage', value: 'storage' },
          { title: 'API & Integration Platform', value: 'integration' },
          { title: 'Language & Framework', value: 'framework' },
          { title: 'Data & Analytics Tool', value: 'analytics' },
        ],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Official Website / Documentation URL',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'icon',
      title: 'Icon / Monogram / Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'icon',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Untitled Technology',
        subtitle: subtitle ? `Category: ${subtitle}` : 'Uncategorized',
        media,
      };
    },
  },
});
