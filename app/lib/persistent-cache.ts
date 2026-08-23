type CacheRecord<T> = {
  cache_key: string;
  payload: T;
  expires_at: string;
  updated_at?: string;
};

const table = "market_api_cache";

type PersistentCacheConfig = {
  url: string;
  secretKey: string;
};

export type PersistentCacheHit<T> = {
  value: T;
  expiresAt: number;
};

export type PersistentCacheHealth = {
  configured: boolean;
  reachable: boolean;
  hasEntries: boolean;
  latestUpdatedAt: string | null;
};

function getConfig(): PersistentCacheConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = (
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!url || !secretKey) return null;

  try {
    return { url: new URL(url).origin, secretKey };
  } catch {
    return null;
  }
}

export function hasPersistentCache() {
  return getConfig() !== null;
}

function headers(config: PersistentCacheConfig): Record<string, string> {
  return {
    apikey: config.secretKey,
    Authorization: `Bearer ${config.secretKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function getPersistentCache<T>(
  cacheKey: string,
): Promise<PersistentCacheHit<T> | null> {
  const config = getConfig();
  if (!config) return null;

  const url = new URL(`/rest/v1/${table}`, config.url);
  url.searchParams.set("cache_key", `eq.${cacheKey}`);
  url.searchParams.set("select", "cache_key,payload,expires_at");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, {
      headers: headers(config),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as Array<CacheRecord<T>>;
    const row = rows[0];
    const expiresAt = row ? Date.parse(row.expires_at) : Number.NaN;
    if (!row || !Number.isFinite(expiresAt) || expiresAt <= Date.now())
      return null;
    return { value: row.payload, expiresAt };
  } catch {
    return null;
  }
}

export async function setPersistentCache<T>(
  cacheKey: string,
  payload: T,
  expiresAt: number,
): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  const url = new URL(`/rest/v1/${table}`, config.url);
  url.searchParams.set("on_conflict", "cache_key");
  const body = [
    {
      cache_key: cacheKey,
      payload,
      expires_at: new Date(expiresAt).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...headers(config),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getPersistentCacheHealth(): Promise<PersistentCacheHealth> {
  const config = getConfig();
  if (!config)
    return {
      configured: false,
      reachable: false,
      hasEntries: false,
      latestUpdatedAt: null,
    };

  const url = new URL(`/rest/v1/${table}`, config.url);
  url.searchParams.set("select", "updated_at");
  url.searchParams.set("order", "updated_at.desc");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, {
      headers: headers(config),
      cache: "no-store",
    });
    if (!response.ok)
      return {
        configured: true,
        reachable: false,
        hasEntries: false,
        latestUpdatedAt: null,
      };
    const rows = (await response.json()) as Array<
      Pick<CacheRecord<unknown>, "updated_at">
    >;
    return {
      configured: true,
      reachable: true,
      hasEntries: rows.length > 0,
      latestUpdatedAt: rows[0]?.updated_at ?? null,
    };
  } catch {
    return {
      configured: true,
      reachable: false,
      hasEntries: false,
      latestUpdatedAt: null,
    };
  }
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
