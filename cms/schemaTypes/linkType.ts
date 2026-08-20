import { defineField, defineType } from 'sanity';

export const linkType = defineType({
  name: 'link',
  title: 'External Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(100),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({
          scheme: ['http', 'https', 'mailto'],
        }),
    }),
    defineField({
      name: 'type',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          { title: 'Repository', value: 'repository' },
          { title: 'Live Demo / Production', value: 'live-demo' },
          { title: 'Documentation', value: 'documentation' },
          { title: 'Research Source / Paper', value: 'research-source' },
          { title: 'External Resource', value: 'external-resource' },
        ],
        layout: 'radio',
      },
      initialValue: 'repository',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url',
      type: 'type',
    },
    prepare({ title, subtitle, type }) {
      return {
        title: title || 'Untitled Link',
        subtitle: `[${type || 'link'}] ${subtitle || 'No URL'}`,
      };
    },
  },
});
