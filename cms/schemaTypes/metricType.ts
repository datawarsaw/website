import { defineField, defineType } from 'sanity';

export const metricType = defineType({
  name: 'metric',
  title: 'Metric / Key Statistic',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Metric dimension (e.g. "Trigger Frequency", "Execution Runtime", "Evaluation Engine")',
      validation: (rule) => rule.required().min(2).max(60),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'Metric value (e.g. "Every 5 Minutes", "Cloudflare Workers", "GLM-4.7-Flash")',
      validation: (rule) => rule.required().min(1).max(100),
    }),
    defineField({
      name: 'unit',
      title: 'Unit (Optional)',
      type: 'string',
      description: 'Optional measurement unit (e.g. "ms", "req/sec", "%")',
    }),
    defineField({
      name: 'description',
      title: 'Description (Optional)',
      type: 'string',
      description: 'Short explanatory context for this metric',
    }),
    defineField({
      name: 'isAccent',
      title: 'Highlight / Accent Color',
      type: 'boolean',
      description: 'Highlight this statistic with the acid-lime accent color',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'label',
      value: 'value',
      unit: 'unit',
      accent: 'isAccent',
    },
    prepare({ title, value, unit, accent }) {
      const valStr = unit ? `${value} ${unit}` : value;
      return {
        title: title || 'Untitled Metric',
        subtitle: `${valStr || 'No value'}${accent ? ' (Highlighted)' : ''}`,
      };
    },
  },
});
