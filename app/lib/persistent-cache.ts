type CacheRecord<T> = {
  cache_key: string;
  payload: T;
  expires_at: string;
  updated_at?: string;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const table = "market_api_cache";

export function hasPersistentCache() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function headers() {
  if (!supabaseServiceRoleKey) return {};
  return {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
    "Content-Type": "application/json",
  };
}

export async function getPersistentCache<T>(cacheKey: string): Promise<T | null> {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;

  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  url.searchParams.set("cache_key", `eq.${cacheKey}`);
  url.searchParams.set("select", "cache_key,payload,expires_at");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, { headers: headers(), cache: "no-store" });
    if (!response.ok) return null;
    const rows = await response.json() as Array<CacheRecord<T>>;
    const row = rows[0];
    if (!row || Date.parse(row.expires_at) <= Date.now()) return null;
    return row.payload;
  } catch {
    return null;
  }
}

export async function setPersistentCache<T>(cacheKey: string, payload: T, ttlMs: number): Promise<void> {
  if (!supabaseUrl || !supabaseServiceRoleKey) return;

  const url = `${supabaseUrl}/rest/v1/${table}?on_conflict=cache_key`;
  const body = [{
    cache_key: cacheKey,
    payload,
    expires_at: new Date(Date.now() + ttlMs).toISOString(),
    updated_at: new Date().toISOString(),
  }];

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        ...headers(),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    // Persistent cache is an optimization; upstream data remains the fallback.
  }
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
