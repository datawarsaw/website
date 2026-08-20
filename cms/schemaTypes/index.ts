import { experimentType } from './experimentType';
import { technologyType } from './technologyType';
import { tagType } from './tagType';
import { seoType } from './seoType';
import { metricType } from './metricType';
import { linkType } from './linkType';
import { blockContentType } from './blockContentType';

export const schemaTypes = [
  // Document types
  experimentType,
  technologyType,
  tagType,

  // Reusable object types
  seoType,
  metricType,
  linkType,
  blockContentType,
];
