create table if not exists public.daily_workflow_records (
  user_id uuid not null references auth.users (id) on delete cascade,
  workflow_date date not null,
  symbol text not null check (symbol ~ '^[A-Z][A-Z0-9.]{0,9}$'),
  checked_items jsonb not null default '[]'::jsonb check (jsonb_typeof(checked_items) = 'array'),
  decision text not null check (decision in ('Not decided', 'Buy', 'Wait', 'Watch')),
  note text not null default '' check (char_length(note) <= 2000),
  reference_price numeric null check (reference_price is null or reference_price > 0),
  market_as_of text null,
  saved_at timestamptz not null default now(),
  primary key (user_id, workflow_date, symbol)
);

create index if not exists daily_workflow_records_user_saved_at_idx
  on public.daily_workflow_records (user_id, saved_at desc);

alter table public.daily_workflow_records enable row level security;

revoke all on table public.daily_workflow_records from anon;
revoke all on table public.daily_workflow_records from authenticated;
grant select, insert, update, delete on table public.daily_workflow_records to authenticated;
grant select, insert, update, delete on table public.daily_workflow_records to service_role;

drop policy if exists "Users can read their daily workflow records" on public.daily_workflow_records;
create policy "Users can read their daily workflow records"
  on public.daily_workflow_records
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their daily workflow records" on public.daily_workflow_records;
create policy "Users can insert their daily workflow records"
  on public.daily_workflow_records
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their daily workflow records" on public.daily_workflow_records;
create policy "Users can update their daily workflow records"
  on public.daily_workflow_records
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their daily workflow records" on public.daily_workflow_records;
create policy "Users can delete their daily workflow records"
  on public.daily_workflow_records
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Browser clients use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and these RLS policies.
-- Never expose SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY to client code.

-- จัดทำโดย: นายฐิติ เทอดพิทักษ์พงษ์ โดยใช้เทคโนโลยี AI จาก OpenAI · © 2026 Thiti Theadphitukphong · All Rights Reserved.
