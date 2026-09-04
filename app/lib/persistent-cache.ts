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

export type PersistentCacheEntry<T> = PersistentCacheHit<T> & {
  updatedAt: string | null;
  isExpired: boolean;
};

export type PersistentCacheHealth = {
  configured: boolean;
  reachable: boolean;
  hasEntries: boolean;
  latestUpdatedAt: string | null;
  latestExpiresAt: string | null;
  entryCount: number;
  expectedEntryCount: number;
  freshEntryCount: number;
  staleEntryCount: number;
  freshCoverageCount: number;
  missingEntryCount: number;
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
  const entry = await getPersistentCacheEntry<T>(cacheKey);
  if (!entry || entry.isExpired) return null;
  return { value: entry.value, expiresAt: entry.expiresAt };
}

export async function getPersistentCacheEntry<T>(
  cacheKey: string,
): Promise<PersistentCacheEntry<T> | null> {
  const config = getConfig();
  if (!config) return null;

  const url = new URL(`/rest/v1/${table}`, config.url);
  url.searchParams.set("cache_key", `eq.${cacheKey}`);
  url.searchParams.set("select", "cache_key,payload,expires_at,updated_at");
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
    if (!row || !Number.isFinite(expiresAt)) return null;
    return {
      value: row.payload,
      expiresAt,
      updatedAt: row.updated_at ?? null,
      isExpired: expiresAt <= Date.now(),
    };
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

function emptyHealth(
  configured: boolean,
  reachable: boolean,
): PersistentCacheHealth {
  return {
    configured,
    reachable,
    hasEntries: false,
    latestUpdatedAt: null,
    latestExpiresAt: null,
    entryCount: 0,
    expectedEntryCount: 0,
    freshEntryCount: 0,
    staleEntryCount: 0,
    freshCoverageCount: 0,
    missingEntryCount: 0,
  };
}

export async function getPersistentCacheHealth(
  expectedCacheKeys: readonly string[] = [],
): Promise<PersistentCacheHealth> {
  const config = getConfig();
  if (!config)
    return {
      ...emptyHealth(false, false),
      expectedEntryCount: expectedCacheKeys.length,
      missingEntryCount: expectedCacheKeys.length,
    };

  const url = new URL(`/rest/v1/${table}`, config.url);
  url.searchParams.set("select", "cache_key,expires_at,updated_at");
  url.searchParams.set("order", "updated_at.desc");
  url.searchParams.set("limit", "100");

  try {
    const response = await fetch(url, {
      headers: headers(config),
      cache: "no-store",
    });
    if (!response.ok)
      return {
        ...emptyHealth(true, false),
        expectedEntryCount: expectedCacheKeys.length,
        missingEntryCount: expectedCacheKeys.length,
      };
    const rows = (await response.json()) as Array<
      Pick<CacheRecord<unknown>, "cache_key" | "expires_at" | "updated_at">
    >;
    const now = Date.now();
    const freshRows = rows.filter((row) => {
      const expiresAt = Date.parse(row.expires_at);
      return Number.isFinite(expiresAt) && expiresAt > now;
    });
    const freshKeys = new Set(freshRows.map((row) => row.cache_key));
    const freshCoverageCount = expectedCacheKeys.filter((key) =>
      freshKeys.has(key),
    ).length;
    const latestExpiresAt = rows
      .map((row) => row.expires_at)
      .filter((value) => Number.isFinite(Date.parse(value)))
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
    return {
      configured: true,
      reachable: true,
      hasEntries: rows.length > 0,
      latestUpdatedAt: rows[0]?.updated_at ?? null,
      latestExpiresAt,
      entryCount: rows.length,
      expectedEntryCount: expectedCacheKeys.length,
      freshEntryCount: freshRows.length,
      staleEntryCount: rows.length - freshRows.length,
      freshCoverageCount,
      missingEntryCount: Math.max(0, expectedCacheKeys.length - freshCoverageCount),
    };
  } catch {
    return {
      ...emptyHealth(true, false),
      expectedEntryCount: expectedCacheKeys.length,
      missingEntryCount: expectedCacheKeys.length,
    };
  }
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
