import { defineArrayMember, defineType } from 'sanity';

export const blockContentType = defineType({
  name: 'blockContent',
  title: 'Structured Narrative Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Heading 4', value: 'h4' },
        { title: 'Lead Paragraph', value: 'lead' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet List', value: 'bullet' },
        { title: 'Numbered List', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong / Bold', value: 'strong' },
          { title: 'Emphasis / Italic', value: 'em' },
          { title: 'Inline Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Hyperlink',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (rule) =>
                  rule.required().uri({
                    scheme: ['http', 'https', 'mailto'],
                  }),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      title: 'Inline Diagram / Figure',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text (Accessibility & SEO)',
          description: 'Required description of the image content for screen readers.',
          validation: (rule) => rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    defineArrayMember({
      name: 'callout',
      type: 'object',
      title: 'Callout Box',
      fields: [
        {
          name: 'title',
          title: 'Callout Title',
          type: 'string',
          validation: (rule) => rule.required(),
        },
        {
          name: 'body',
          title: 'Callout Text',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.required(),
        },
      ],
      preview: {
        select: {
          title: 'title',
          subtitle: 'body',
        },
      },
    }),
    defineArrayMember({
      name: 'codeSnippet',
      type: 'object',
      title: 'Code Snippet',
      fields: [
        {
          name: 'title',
          title: 'Filename or Snippet Title',
          type: 'string',
        },
        {
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
            list: [
              { title: 'TypeScript / JavaScript', value: 'typescript' },
              { title: 'Python', value: 'python' },
              { title: 'SQL', value: 'sql' },
              { title: 'JSON', value: 'json' },
              { title: 'HTML / CSS', value: 'html' },
              { title: 'Bash / Shell', value: 'bash' },
            ],
          },
          initialValue: 'typescript',
        },
        {
          name: 'code',
          title: 'Code',
          type: 'text',
          rows: 8,
          validation: (rule) => rule.required(),
        },
      ],
      preview: {
        select: {
          title: 'title',
          language: 'language',
        },
        prepare({ title, language }) {
          return {
            title: title || 'Code Snippet',
            subtitle: language || 'code',
          };
        },
      },
    }),
  ],
});
