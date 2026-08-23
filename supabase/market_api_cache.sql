create table if not exists public.market_api_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists market_api_cache_expires_at_idx
  on public.market_api_cache (expires_at);

alter table public.market_api_cache enable row level security;

revoke all on table public.market_api_cache from anon, authenticated;
grant select, insert, update, delete on table public.market_api_cache to service_role;

-- This table is intended for server-side access with SUPABASE_SECRET_KEY only.
-- The legacy SUPABASE_SERVICE_ROLE_KEY name remains supported during migration.
-- Never expose either elevated key to browser/client code.

-- จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
