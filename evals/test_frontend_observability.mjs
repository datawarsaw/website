
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, '../site/observability/script.js');

const scriptSource = fs.readFileSync(scriptPath, 'utf8');

console.log('=== VERIFYING FRONTEND SCRIPT LOGIC (site/observability/script.js) ===');

// 1. Check constants & endpoints
assert(scriptSource.includes("const PRIMARY_DATA_URL = '/api/telemetry';"), "PRIMARY_DATA_URL must point to /api/telemetry");
assert(scriptSource.includes("const FALLBACK_DATA_URL = '../data/current-run.json';"), "FALLBACK_DATA_URL must point to ../data/current-run.json");
assert(scriptSource.includes("POLL_INTERVAL_ACTIVE_MS = 2000;"), "Active polling interval must be ~2000ms");
assert(scriptSource.includes("POLL_INTERVAL_IDLE_MS = 10000;"), "Idle polling interval must be ~10000ms");

// 2. Check no-store fetch cache option
assert(scriptSource.includes("cache: 'no-store'"), "Fetch requests must specify cache: 'no-store'");

// 3. Check visibilitychange handler & document.hidden pause
assert(scriptSource.includes("document.hidden"), "Must check document.hidden to pause polling");
assert(scriptSource.includes("visibilitychange"), "Must register visibilitychange listener");

// 4. Check fallback logic and hash suppression
assert(scriptSource.includes("lastPayloadHash"), "Must maintain hash-based render suppression");
assert(scriptSource.includes("renderDashboard"), "Must invoke renderDashboard on valid data");

console.log('ALL FRONTEND STATIC & ARCHITECTURAL CHECKS PASSED.');
