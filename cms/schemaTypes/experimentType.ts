import { defineArrayMember, defineField, defineType } from 'sanity';

export const experimentType = defineType({
  name: 'experiment',
  title: 'AI Experiment & System',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content & Overview', default: true },
    { name: 'classification', title: 'Classification & Stack' },
    { name: 'metricsAndLinks', title: 'Metrics & Links' },
    { name: 'media', title: 'Media & Visuals' },
    { name: 'seo', title: 'SEO & Metadata' },
  ],
  fields: [
    // Group: Content
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      description: 'e.g. "Scout — Autonomous Intelligence for X Bookmarks"',
      validation: (rule) => rule.required().min(5).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 80,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'number',
      title: 'Experiment Sequence Number',
      type: 'string',
      group: 'content',
      description: 'Two-digit identifier, e.g. "01", "02"',
      validation: (rule) => rule.required().regex(/^\d{2}$/, { name: 'two-digit number', invert: false }),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / Architecture Pipeline Formula',
      type: 'string',
      group: 'content',
      description: 'e.g. "X API → Cloudflare Agent → GLM-4.7-Flash → Notion Knowledge Inbox"',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'summary',
      title: 'Executive Summary',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'High-signal summary (recommended 120-250 characters) displayed on directory cards.',
      validation: (rule) => rule.required().min(40).max(350),
    }),
    defineField({
      name: 'body',
      title: 'Case Study Narrative Body',
      type: 'blockContent',
      group: 'content',
      description: 'Detailed problem statement, architectural thesis, engineering decisions, and findings.',
    }),

    // Group: Classification
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'classification',
      options: {
        list: [
          { title: 'Edge Agents (Autonomous / Worker)', value: 'Edge Agent' },
          { title: 'Orchestration (Multi-Agent / Telemetry)', value: 'Orchestration' },
          { title: 'Data Analytics & Semantic Models', value: 'Data Analytics' },
          { title: 'Applied Research / Laboratory', value: 'Lab' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Lifecycle Status Display Label',
      type: 'string',
      group: 'classification',
      description: 'User-facing status string, e.g. "Production MVP", "Active V1.3", "In Design"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'statusType',
      title: 'Lifecycle Status Classification',
      type: 'string',
      group: 'classification',
      description: 'Controls UI status badge styling (production lime dot, active blue dot, lab muted dot, or archived)',
      options: {
        list: [
          { title: 'Active / Production System', value: 'production' },
          { title: 'Active In-Development / Telemetry', value: 'active' },
          { title: 'Lab Prototype / In Design', value: 'lab' },
          { title: 'Completed / Archived', value: 'archived' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'active',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Release / Milestone Date',
      type: 'string',
      group: 'classification',
      description: 'Display date, e.g. "August 2026", "Roadmap 2026"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Case Study',
      type: 'boolean',
      group: 'classification',
      description: 'If checked, renders with the full featured wide card layout on the directory page.',
      initialValue: false,
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies Used',
      type: 'array',
      group: 'classification',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'technology' }] })],
      description: 'Select technologies from the Technology library',
    }),
    defineField({
      name: 'tags',
      title: 'Taxonomy Tags',
      type: 'array',
      group: 'classification',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'tag' }] })],
      description: 'Select tags from the Tag library',
    }),

    // Group: Metrics & Links
    defineField({
      name: 'metrics',
      title: 'Key Metrics & Statistics Strip',
      type: 'array',
      group: 'metricsAndLinks',
      of: [defineArrayMember({ type: 'metric' })],
      description: 'Key performance, runtime, frequency, or architectural parameters.',
    }),
    defineField({
      name: 'links',
      title: 'Resource Links & Repositories',
      type: 'array',
      group: 'metricsAndLinks',
      of: [defineArrayMember({ type: 'link' })],
    }),
    defineField({
      name: 'relatedExperiments',
      title: 'Related Experiments',
      type: 'array',
      group: 'metricsAndLinks',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'experiment' }] })],
    }),

    // Group: Media
    defineField({
      name: 'heroImage',
      title: 'Hero Architecture Diagram / Visual',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (rule) => rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    defineField({
      name: 'screenshots',
      title: 'Supporting Screenshots & Execution Logs',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              validation: (rule) => rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        }),
      ],
    }),

    // Group: SEO
    defineField({
      name: 'seo',
      title: 'Search Engine Optimization',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      number: 'number',
      subtitle: 'subtitle',
      category: 'category',
      status: 'status',
      media: 'heroImage',
    },
    prepare({ title, number, subtitle, category, status, media }) {
      return {
        title: number ? `[${number}] ${title || 'Untitled'}` : title || 'Untitled',
        subtitle: `${category || 'No Category'} · ${status || 'Draft'} — ${subtitle || ''}`,
        media,
      };
    },
  },
});
