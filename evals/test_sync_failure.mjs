import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const snapshotPath = 'site/data/sanity-experiments.json';
const initialContent = fs.readFileSync(snapshotPath, 'utf-8');

console.log('=== Testing Sync Script Failure Handling ===');

// Simulate network/host failure by injecting an invalid API host
const syncScript = fs.readFileSync('scripts/sync_sanity_experiments.mjs', 'utf-8');
const brokenScript = syncScript.replace(
  'https://${PROJECT_ID}.api.sanity.io',
  'https://invalid-host-for-testing-12345.sanity.io'
);

const result = spawnSync('node', ['--input-type=module', '-e', brokenScript], {
  encoding: 'utf-8'
});

console.log('Process Exit Code:', result.status);
console.log('Process Output:', (result.stderr || result.stdout).trim());

const afterContent = fs.readFileSync(snapshotPath, 'utf-8');
const isPreserved = initialContent === afterContent;
console.log('Previous Snapshot Preserved:', isPreserved);

if (result.status !== 1) {
  throw new Error(`Expected exit code 1 on failure, got ${result.status}`);
}

if (!isPreserved) {
  throw new Error('Snapshot was modified or destroyed during failed execution!');
}

console.log('\n[PASS] Build-time failure handling verified: non-zero exit and atomic snapshot preservation.');
