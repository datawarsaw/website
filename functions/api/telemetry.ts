interface Env {
  DB: D1Database;
  TELEMETRY_SECRET_TOKEN?: string;
}

interface TelemetryPayload {
  taskId: string;
  task?: string;
  status: string;
  startedAt?: string;
  updatedAt: string;
  endedAt?: string;
  duration?: string;
  branch?: string;
  harness?: string;
  flow?: string;
  currentActivity?: {
    stepId?: string;
    role?: string;
    activity?: string;
    model?: string;
    startedAt?: string;
  } | null;
  steps?: Array<{
    id: string;
    role?: string;
    model?: string;
    status: string;
    startedAt?: string;
    endedAt?: string;
    duration?: string;
    activity?: string;
    summary?: string;
  }>;
  events?: Array<{
    timestamp: string;
    type: string;
    label: string;
  }>;
  [key: string]: unknown;
}

const MAX_BODY_SIZE_BYTES = 131072; // 128 KB

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function validateTelemetryPayload(data: unknown): { valid: boolean; error?: string; payload?: TelemetryPayload } {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, error: "Payload must be a JSON object" };
  }
  const obj = data as Record<string, unknown>;
  if (typeof obj.taskId !== "string" || !obj.taskId.trim()) {
    return { valid: false, error: "Missing or invalid 'taskId'" };
  }
  if (typeof obj.status !== "string" || !obj.status.trim()) {
    return { valid: false, error: "Missing or invalid 'status'" };
  }
  if (typeof obj.updatedAt !== "string" || !obj.updatedAt.trim()) {
    return { valid: false, error: "Missing or invalid 'updatedAt'" };
  }
  if (obj.steps !== undefined && !Array.isArray(obj.steps)) {
    return { valid: false, error: "'steps' must be an array" };
  }
  if (obj.events !== undefined && !Array.isArray(obj.events)) {
    return { valid: false, error: "'events' must be an array" };
  }
  return { valid: true, payload: obj as unknown as TelemetryPayload };
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      "Allow": "GET, POST, OPTIONS, HEAD",
    },
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  if (!env.DB) {
    return jsonResponse(
      { error: "Database binding 'DB' not configured", fallback: true },
      503
    );
  }

  try {
    const row = await env.DB.prepare(
      "SELECT payload, updated_at FROM telemetry_state WHERE id = 1"
    ).first<{ payload: string; updated_at: number }>();

    if (!row || !row.payload) {
      return jsonResponse(
        { error: "No active telemetry state found", fallback: true },
        404
      );
    }

    return new Response(row.payload, {
      status: 200,
      headers: {
        ...JSON_HEADERS,
        ...CORS_HEADERS,
        "X-Telemetry-Updated-At": String(row.updated_at),
      },
    });
  } catch {
    return jsonResponse(
      { error: "Failed to read telemetry state", fallback: true },
      500
    );
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const secretToken = env.TELEMETRY_SECRET_TOKEN;
  if (!secretToken || typeof secretToken !== "string" || !secretToken.trim()) {
    return jsonResponse(
      { error: "Server authentication secret is not configured" },
      500
    );
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return jsonResponse(
      { error: "Unauthorized: Missing or malformed Authorization header" },
      401
    );
  }

  const token = authHeader.slice(7).trim();
  if (!token || token !== secretToken.trim()) {
    return jsonResponse(
      { error: "Unauthorized: Invalid authorization token" },
      401
    );
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse(
      { error: "Unsupported Media Type: Content-Type must be application/json" },
      415
    );
  }

  const contentLength = request.headers.get("Content-Length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE_BYTES) {
    return jsonResponse(
      { error: "Payload Too Large: Request body exceeds size limit" },
      413
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE_BYTES) {
      return jsonResponse(
        { error: "Payload Too Large: Request body exceeds size limit" },
        413
      );
    }
  } catch {
    return jsonResponse(
      { error: "Bad Request: Failed to read request body" },
      400
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return jsonResponse(
      { error: "Bad Request: Invalid JSON body" },
      400
    );
  }

  const validation = validateTelemetryPayload(parsed);
  if (!validation.valid) {
    return jsonResponse(
      { error: "Bad Request: " + validation.error },
      400
    );
  }

  if (!env.DB) {
    return jsonResponse(
      { error: "Database binding 'DB' not configured" },
      503
    );
  }

  const canonicalJson = JSON.stringify(validation.payload);
  const nowMs = Date.now();

  try {
    await env.DB.prepare(
      "INSERT INTO telemetry_state (id, payload, updated_at) VALUES (1, ?, ?) " +
      "ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at"
    ).bind(canonicalJson, nowMs).run();

    return jsonResponse(
      { success: true, taskId: validation.payload?.taskId, updatedAt: nowMs },
      200
    );
  } catch {
    return jsonResponse(
      { error: "Internal Server Error: Failed to persist telemetry" },
      500
    );
  }
};
