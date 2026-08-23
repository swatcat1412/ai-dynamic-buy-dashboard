import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { getPersistentCache, hasPersistentCache, setPersistentCache } from "./persistent-cache.ts";

const originalFetch = globalThis.fetch;
const originalEnvironment = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("prefers the new Supabase secret key and reads a valid cache hit", async () => {
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-secret-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "legacy-key";
  const expiresAt = Date.now() + 60_000;

  globalThis.fetch = async (_input, init) => {
    assert.equal(new Headers(init?.headers).get("apikey"), "test-secret-key");
    return Response.json([{ cache_key: "key", payload: { ok: true }, expires_at: new Date(expiresAt).toISOString() }]);
  };

  assert.equal(hasPersistentCache(), true);
  assert.deepEqual(await getPersistentCache<{ ok: boolean }>("key"), { value: { ok: true }, expiresAt });
});

test("reports a failed persistent write without breaking the caller", async () => {
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_SECRET_KEY = "test-secret-key";
  globalThis.fetch = async () => new Response(null, { status: 403 });

  assert.equal(await setPersistentCache("key", { ok: true }, Date.now() + 60_000), false);
});

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
