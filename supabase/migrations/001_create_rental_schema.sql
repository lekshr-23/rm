create extension if not exists pgcrypto;

create table if not exists public.r_producttype (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz not null default now(),
    created_by text,
    is_active smallint not null default 1 check (is_active in (0, 1))
);

create table if not exists public.r_productcategory (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    producttype_id uuid not null references public.r_producttype(id) on delete cascade,
    created_at timestamptz not null default now(),
    created_by text,
    is_active smallint not null default 1 check (is_active in (0, 1))
);

create table if not exists public.r_assets (
    id uuid primary key default gen_random_uuid(),
    serial_number text not null,
    sku text not null,
    producttype_id uuid not null references public.r_producttype(id) on delete cascade,
    category_id uuid not null references public.r_productcategory(id) on delete cascade,
    color_hex text not null default '#3b82f6',
    created_at timestamptz not null default now(),
    created_by text,
    is_active smallint not null default 1 check (is_active in (0, 1))
);

create table if not exists public.r_bookings (
    id uuid primary key default gen_random_uuid(),
    asset_id uuid not null references public.r_assets(id) on delete cascade,
    customer_name text not null,
    customer_email text,
    start_time timestamptz not null,
    end_time timestamptz not null,
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'active', 'returned')),
    notes text,
    created_at timestamptz not null default now(),
    created_by text,
    constraint booking_end_after_start check (end_time > start_time)
);

alter table public.r_producttype enable row level security;
alter table public.r_productcategory enable row level security;
alter table public.r_assets enable row level security;
alter table public.r_bookings enable row level security;

create policy "Authenticated users can access product types" on public.r_producttype
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated users can access product categories" on public.r_productcategory
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated users can access assets" on public.r_assets
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated users can access bookings" on public.r_bookings
    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create unique index if not exists r_producttype_name_idx on public.r_producttype(lower(name));
create unique index if not exists r_productcategory_name_idx on public.r_productcategory(lower(name), producttype_id);
create unique index if not exists r_assets_serial_number_idx on public.r_assets(lower(serial_number));
create unique index if not exists r_assets_sku_idx on public.r_assets(lower(sku));

create index if not exists r_bookings_asset_time_idx on public.r_bookings(asset_id, start_time, end_time);

alter table public.r_bookings
    add constraint r_bookings_no_overlap
    exclude using gist (
        asset_id with =,
        tstzrange(start_time, end_time, '[)') with &&
    );

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON r_producttype, r_productcategory, r_assets, r_bookings TO anon, authenticated;
