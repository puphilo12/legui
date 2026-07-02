-- =====================================================================
-- LEGUI · Sistema de emails (Resend)
-- Ejecutar en Supabase → SQL Editor → New query (solo una vez).
-- =====================================================================

-- ---- product_waitlist: "avisame cuando llegue" en la ficha de producto ----
create table if not exists public.product_waitlist (
  id           text        primary key default gen_random_uuid()::text,
  store_id     text        not null references public.settings(store_id) on delete cascade,
  product_id   text        not null,
  product_name text        not null,
  email        text        not null,
  notified     boolean     not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists product_waitlist_lookup_idx on public.product_waitlist (store_id, product_id, notified);

alter table public.product_waitlist enable row level security;

-- Cualquier visitante puede anotarse desde la ficha del producto.
drop policy if exists "public_insert_waitlist" on public.product_waitlist;
create policy "public_insert_waitlist" on public.product_waitlist for insert to anon, authenticated with check (true);

-- Solo el admin gestiona/lee la lista (el envío real lo hace el servidor con service_role).
drop policy if exists "auth_all_waitlist" on public.product_waitlist;
create policy "auth_all_waitlist" on public.product_waitlist for all to authenticated using (true) with check (true);

grant insert on public.product_waitlist to anon;
grant select, insert, update, delete on public.product_waitlist to authenticated;
