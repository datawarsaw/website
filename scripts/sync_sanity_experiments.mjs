/**
 * Build-time Sanity -> DataWarsaw experiment synchronizer.
 * Fetches published experiments from the live Sanity Content Lake
 * and writes a deterministic local snapshot.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PROJECT_ID = 'oxemv355';
const DATASET = 'production';

// Intentionally pinned for stable Sanity API behavior.
const API_VERSION = '2026-08-20';

const SANITY_API_HOST = `https://${PROJECT_ID}.api.sanity.io`;
const PERSPECTIVE = 'published';

const TARGET_SNAPSHOT_FILE = path.join(
  ROOT_DIR,
  'site',
  'data',
  'sanity-experiments.json',
);

const GROQ_QUERY = `*[
  _type == "experiment" &&
  !(_id in path("drafts.**"))
] | order(number asc) {
  "id": slug.current,
  "slug": slug.current,
  "number": number,
  "title": title,
  "subtitle": subtitle,
  "summary": summary,
  "status": status,
  "statusType": statusType,
  "date": date,
  "category": category,
  "featured": coalesce(featured, false),
  "tags": coalesce(tags[]->name, []),
  "technologies": coalesce(technologies[]->name, []),
  "url": coalesce(
    links[type == "live-demo"][0].url,
    select(
      statusType == "lab" => "#",
      "/experiments/" + slug.current + "/"
    )
  ),
  "metrics": coalesce(metrics[]{
    label,
    value,
    unit,
    isAccent,
    description
  }, []),
  "seo": seo{
    metaTitle,
    metaDescription,
    canonicalUrl,
    noIndex
  }
}`;

function fail(message) {
  console.error(`[Sanity Sync] ${message}`);
  process.exitCode = 1;
}

function validateExperiment(experiment, index) {
  if (!experiment || typeof experiment !== 'object' || Array.isArray(experiment)) {
    throw new Error(`Result item ${index} is not an object.`);
  }

  const requiredStringFields = ['id', 'slug', 'number', 'title'];

  for (const field of requiredStringFields) {
    if (
      typeof experiment[field] !== 'string' ||
      experiment[field].trim().length === 0
    ) {
      throw new Error(
        `Result item ${index} has an invalid or missing "${field}" field.`,
      );
    }
  }

  if (!Array.isArray(experiment.tags)) {
    throw new Error(`Result item ${index} has an invalid "tags" field.`);
  }

  if (!Array.isArray(experiment.technologies)) {
    throw new Error(
      `Result item ${index} has an invalid "technologies" field.`,
    );
  }

  if (!Array.isArray(experiment.metrics)) {
    throw new Error(`Result item ${index} has an invalid "metrics" field.`);
  }
}

async function syncExperiments() {
  console.log(
    `[Sanity Sync] Querying live Content Lake (${PROJECT_ID}/${DATASET})...`,
  );
  console.log(
    `[Sanity Sync] Perspective: ${PERSPECTIVE} | API version: ${API_VERSION}`,
  );

  const queryUrl = new URL(
    `/v${API_VERSION}/data/query/${DATASET}`,
    SANITY_API_HOST,
  );

  queryUrl.searchParams.set('query', GROQ_QUERY);
  queryUrl.searchParams.set('perspective', PERSPECTIVE);

  let response;

  try {
    response = await fetch(queryUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'DataWarsaw-BuildSync/1.0',
      },
    });
  } catch (error) {
    throw new Error(`Network request failed: ${error.message}`);
  }

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');

    throw new Error(
      `Sanity returned HTTP ${response.status} ${response.statusText}` +
        (responseText ? `: ${responseText}` : ''),
    );
  }

  let payload;

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`Could not parse the Sanity response: ${error.message}`);
  }

  if (!payload || !Array.isArray(payload.result)) {
    throw new Error('Invalid response: payload.result must be an array.');
  }

  const experiments = payload.result;

  experiments.forEach(validateExperiment);

  const serialized = `${JSON.stringify(experiments, null, 2)}\n`;
  const targetDirectory = path.dirname(TARGET_SNAPSHOT_FILE);

  fs.mkdirSync(targetDirectory, {recursive: true});

  const temporaryFile = path.join(
    targetDirectory,
    `.sanity-experiments.${process.pid}.${Date.now()}.tmp`,
  );

  try {
    fs.writeFileSync(temporaryFile, serialized, {
      encoding: 'utf8',
      flag: 'wx',
    });

    fs.renameSync(temporaryFile, TARGET_SNAPSHOT_FILE);
  } catch (error) {
    try {
      fs.rmSync(temporaryFile, {force: true});
    } catch {
      // Preserve the original write error.
    }

    throw new Error(
      `Could not replace the experiment snapshot safely: ${error.message}`,
    );
  }

  console.log(
    `[Sanity Sync] Synced ${experiments.length} published experiment(s).`,
  );
  console.log(`[Sanity Sync] Snapshot: ${TARGET_SNAPSHOT_FILE}`);
}

try {
  await syncExperiments();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
