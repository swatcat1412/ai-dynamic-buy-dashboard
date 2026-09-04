export type MarketConnectionState =
  | "checking"
  | "configured"
  | "connected"
  | "degraded"
  | "unconfigured"
  | "error";

export type MarketQuotaSnapshot = {
  used: number;
  left: number;
  limit: number;
  observedAt: string;
};

export type MarketRuntimeSnapshot = {
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorCode: string | null;
  servingStale: boolean;
  quota: MarketQuotaSnapshot | null;
};

const runtime: MarketRuntimeSnapshot = {
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastErrorAt: null,
  lastErrorCode: null,
  servingStale: false,
  quota: null,
};

function nowIso() {
  return new Date().toISOString();
}

function parseCreditHeader(value: string | null) {
  if (value === null || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function recordMarketAttempt() {
  runtime.lastAttemptAt = nowIso();
}

export function recordMarketSuccess(headers?: Headers) {
  runtime.lastSuccessAt = nowIso();
  runtime.lastErrorCode = null;
  runtime.servingStale = false;

  if (headers) recordMarketQuota(headers);
}

export function recordMarketQuota(headers: Headers) {
  const used = parseCreditHeader(headers.get("api-credits-used"));
  const left = parseCreditHeader(headers.get("api-credits-left"));
  if (used === null || left === null) return;
  runtime.quota = { used, left, limit: used + left, observedAt: nowIso() };
}

export function recordMarketFailure(code: string, servingStale: boolean) {
  runtime.lastErrorAt = nowIso();
  runtime.lastErrorCode = code;
  runtime.servingStale = servingStale;
}

export function getMarketRuntimeSnapshot(): MarketRuntimeSnapshot {
  return {
    ...runtime,
    quota: runtime.quota ? { ...runtime.quota } : null,
  };
}

export function resetMarketObservabilityForTests() {
  runtime.lastAttemptAt = null;
  runtime.lastSuccessAt = null;
  runtime.lastErrorAt = null;
  runtime.lastErrorCode = null;
  runtime.servingStale = false;
  runtime.quota = null;
}

// จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้ OpenAI Codex | © 2026 Thiti Theadphitukphong · All Rights Reserved.
