-- pgcrypto already enabled in 001_create_rental_schema.sql (provides crypt()/gen_salt()).

create table if not exists public.app_users (
    id uuid primary key default gen_random_uuid(),
    username text not null,
    password_hash text not null,
    role text not null check (role in ('admin', 'user', 'driver')),
    created_at timestamptz not null default now(),
    created_by text,
    is_active smallint not null default 1 check (is_active in (0, 1))
);

create unique index if not exists app_users_username_idx on public.app_users(lower(username));

-- RLS is enabled with no policies attached, so the table is not directly
-- readable/writable via the anon or authenticated API roles. All access
-- goes through the SECURITY DEFINER function below, which never returns
-- password_hash to the caller.
alter table public.app_users enable row level security;

create or replace function public.verify_app_user(p_username text, p_password text)
returns table (id uuid, username text, role text)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
    select u.id, u.username, u.role
    from public.app_users u
    where lower(u.username) = lower(p_username)
      and u.is_active = 1
      and u.password_hash = crypt(p_password, u.password_hash);
end;
$$;

revoke all on function public.verify_app_user(text, text) from public;
grant execute on function public.verify_app_user(text, text) to anon, authenticated;

-- To create a user, run (via the Supabase SQL editor, not the app):
--   insert into public.app_users (username, password_hash, role, created_by)
--   values ('admin', crypt('choose-a-strong-password', gen_salt('bf')), 'admin', 'seed');
