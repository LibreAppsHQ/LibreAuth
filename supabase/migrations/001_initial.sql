-- LibreAuth initial schema

create table if not exists public.totp_entries (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	name text not null,
	issuer text,
	secret text not null,
	digits integer not null default 6 check (digits between 6 and 8),
	period integer not null default 30 check (period between 15 and 60),
	algorithm text not null default 'SHA1',
	sort_order integer not null default 0,
	created_at timestamptz not null default now()
);

create index if not exists totp_entries_user_id_idx on public.totp_entries(user_id);

alter table public.totp_entries enable row level security;

create policy "Users read own entries"
	on public.totp_entries for select
	using (auth.uid() = user_id);

create policy "Users insert own entries"
	on public.totp_entries for insert
	with check (auth.uid() = user_id);

create policy "Users update own entries"
	on public.totp_entries for update
	using (auth.uid() = user_id);

create policy "Users delete own entries"
	on public.totp_entries for delete
	using (auth.uid() = user_id);
