import { defineField, defineType } from 'sanity';

export const seoType = defineType({
  name: 'seo',
  title: 'SEO & Social Metadata',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Optimal length: 50-60 characters. Appears in search results and social cards.',
      validation: (rule) =>
        rule.max(70).warning('Titles longer than 70 characters may be truncated by search engines.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Optimal length: 120-160 characters. Summarizes the page in search engine result pages.',
      validation: (rule) =>
        rule.max(200).warning('Descriptions longer than 160 characters may be truncated in search results.'),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL (Optional)',
      type: 'url',
      description: 'Override canonical URL if different from the default https://datawarsaw.com/... route',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'socialImage',
      title: 'Open Graph / Social Share Image',
      type: 'image',
      description: 'Image displayed when shared on social media (recommended ratio 1200x630px)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'noIndex',
      title: 'Prevent Search Engine Indexing (noindex)',
      type: 'boolean',
      description: 'Check to instruct search engines NOT to index this page (defaults to false)',
      initialValue: false,
    }),
  ],
});
