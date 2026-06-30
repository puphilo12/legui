-- =====================================================================
-- LEGUI · Esquema de base de datos (Supabase / PostgreSQL)
-- =====================================================================
-- Cómo usar:
--   1) En el dashboard de Supabase → SQL Editor → New query
--   2) Pegá y ejecutá este archivo (schema.sql)
--   3) Después ejecutá seed.sql para cargar los datos de ejemplo
--   4) Copiá tus claves en el .env del proyecto:
--        VITE_SUPABASE_URL=...
--        VITE_SUPABASE_ANON_KEY=...
--        VITE_STORE_ID=legui
--      y la app deja el MODO MOCK y empieza a leer de esta base.
--
-- Estructura pensada multi-tienda: todo cuelga de `store_id`
-- (igual que el scaffold estilo BV). Cambiá 'legui' por otro id para
-- alojar varias tiendas en la misma base.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- settings: configuración de la tienda (1 fila por store_id)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  store_id                text primary key,
  brand                   text        not null default 'LEGUI',
  slogan_title            text,
  slogan_subtitle         text,
  hero_badge              text,
  hero_image              text,
  whatsapp                text,                       -- sin +, con código país. Ej: 5491100000000
  instagram               text,
  tiktok                  text,
  youtube                 text,
  twitter                 text,                       -- X / Twitter
  facebook                text,
  free_shipping_threshold integer     not null default 0,
  marquee                 text,
  drop_marquee            text,
  mp_public_key           text        default '',     -- MercadoPago public key (opcional)
  alias                   text,                       -- alias / CBU para transferencias
  cbu                     text,
  bank_holder             text,                       -- titular de la cuenta
  banner_url              text,                       -- portada / banner secundario
  updated_at              timestamptz not null default now()
);

-- columnas agregadas después (idempotente)
alter table public.settings add column if not exists alias       text;
alter table public.settings add column if not exists cbu         text;
alter table public.settings add column if not exists bank_holder text;
alter table public.settings add column if not exists banner_url  text;
alter table public.settings add column if not exists youtube     text;
alter table public.settings add column if not exists twitter     text;
alter table public.settings add column if not exists facebook    text;

-- ---------------------------------------------------------------------
-- products: catálogo
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id             text        primary key default gen_random_uuid()::text,
  store_id       text        not null references public.settings(store_id) on delete cascade,
  name           text        not null,
  category       text,
  price          integer     not null default 0,
  discount_price integer,                              -- null = sin oferta
  tag            text,                                 -- Nuevo / Top / Drop / Edición...
  sold_out       boolean     not null default false,
  featured       boolean     not null default false,
  is_offer       boolean     not null default false,
  description    text,
  image          text,                                 -- imagen principal
  images         jsonb       not null default '[]'::jsonb,  -- ["url", ...]
  colors         jsonb       not null default '[]'::jsonb,  -- [{ "name","hex","images":[...hasta 4],"default":bool }]
  sizes          jsonb       not null default '[]'::jsonb,  -- ["38","39",...] | ["S","M",...]
  stock          integer     not null default 0,
  cost           integer     not null default 0,           -- costo unitario (para ganancia/COGS)
  low_stock_threshold integer not null default 5,          -- alerta de stock crítico
  sort           integer     not null default 0,
  created_at     timestamptz not null default now()
);

-- columnas agregadas después (idempotente)
alter table public.products add column if not exists cost integer not null default 0;
alter table public.products add column if not exists low_stock_threshold integer not null default 5;
alter table public.products add column if not exists stock_matrix jsonb not null default '{}'::jsonb; -- { "<color>": { "<talle>": cantidad } }, color "" = sin variante de color

create index if not exists products_store_idx     on public.products (store_id);
create index if not exists products_category_idx  on public.products (store_id, category);
create index if not exists products_featured_idx  on public.products (store_id, featured);

-- ---------------------------------------------------------------------
-- collections: bento de colecciones del home
-- ---------------------------------------------------------------------
create table if not exists public.collections (
  id        text    primary key default gen_random_uuid()::text,
  store_id  text    not null references public.settings(store_id) on delete cascade,
  title     text    not null,
  subtitle  text,
  image     text,
  big       boolean not null default false,            -- ocupa el bloque grande
  sort      integer not null default 0
);

create index if not exists collections_store_idx on public.collections (store_id);

-- ---------------------------------------------------------------------
-- lookbook: grilla editorial del home
-- ---------------------------------------------------------------------
create table if not exists public.lookbook (
  id        text    primary key default gen_random_uuid()::text,
  store_id  text    not null references public.settings(store_id) on delete cascade,
  title     text,
  image     text,
  span      text    not null default 'normal',         -- normal | tall | wide
  sort      integer not null default 0
);

create index if not exists lookbook_store_idx on public.lookbook (store_id, sort);

-- ---------------------------------------------------------------------
-- drops: lanzamientos / ofertas con cuenta regresiva
-- ---------------------------------------------------------------------
create table if not exists public.drops (
  id          text        primary key default gen_random_uuid()::text,
  store_id    text        not null references public.settings(store_id) on delete cascade,
  title       text,
  subtitle    text,
  description text,
  image       text,
  discount    integer,
  units       integer,
  starts_at   timestamptz,                              -- null = la app calcula el próximo viernes 20:00
  active      boolean     not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists drops_store_idx on public.drops (store_id, active);

-- =====================================================================
-- BACK-OFFICE (admin): pedidos, gastos, clientes (cuenta corriente),
-- movimientos de stock. Sólo accesibles para usuarios autenticados.
-- =====================================================================

-- ---- orders: pedidos web + ventas de mostrador (POS) ----
create table if not exists public.orders (
  id             text        primary key default gen_random_uuid()::text,
  store_id       text        not null references public.settings(store_id) on delete cascade,
  created_at     timestamptz not null default now(),
  channel        text        not null default 'web',        -- web | mostrador
  status         text        not null default 'Pendiente',  -- Pendiente|Pagado|Enviado|Entregado|Cancelado
  payment_method text        not null default 'efectivo',
  customer       jsonb       not null default '{}'::jsonb,   -- { nombre, dni, email, ... }
  items          jsonb       not null default '[]'::jsonb,   -- [{ id,name,price,qty,size,color,cost }]
  total          integer     not null default 0,
  created_by     uuid        references auth.users(id) on delete set null
);
create index if not exists orders_store_idx on public.orders (store_id, created_at desc);

-- ---- expenses: gastos ----
create table if not exists public.expenses (
  id          text        primary key default gen_random_uuid()::text,
  store_id    text        not null references public.settings(store_id) on delete cascade,
  description text        not null,
  amount      integer     not null default 0,
  category    text        not null default 'Otros',
  date        date        not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists expenses_store_idx on public.expenses (store_id, date desc);

-- ---- customers: cuenta corriente (fiado) ----
create table if not exists public.customers (
  dni        text        not null,
  store_id   text        not null references public.settings(store_id) on delete cascade,
  nombre     text        not null default '',
  balance    integer     not null default 0,                -- saldo adeudado
  history    jsonb       not null default '[]'::jsonb,       -- [{ date, amount, type:'compra'|'pago' }]
  created_at timestamptz not null default now(),
  primary key (store_id, dni)
);
create index if not exists customers_store_idx on public.customers (store_id);

-- ---- stock_movements: reposiciones / inversión (COGS) ----
create table if not exists public.stock_movements (
  id           text        primary key default gen_random_uuid()::text,
  store_id     text        not null references public.settings(store_id) on delete cascade,
  product_id   text        references public.products(id) on delete set null,
  product_name text        not null,
  units        integer     not null,
  unit_cost    integer     not null default 0,
  total_cost   integer     generated always as (units * unit_cost) stored,
  kind         text        not null default 'reposicion'
                           check (kind in ('carga_inicial', 'reposicion', 'ajuste')),
  notes        text,
  created_at   timestamptz not null default now()
);
create index if not exists stock_movements_store_idx on public.stock_movements (store_id, created_at desc);

-- RLS back-office: sólo autenticados (no lectura pública).
-- (Si querés guardar pedidos web desde el front anónimo, agregá una policy
--  de INSERT para anon en `orders` con un WITH CHECK acotado.)
alter table public.orders          enable row level security;
alter table public.expenses        enable row level security;
alter table public.customers       enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "auth_all_orders" on public.orders;
create policy "auth_all_orders" on public.orders for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_expenses" on public.expenses;
create policy "auth_all_expenses" on public.expenses for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_customers" on public.customers;
create policy "auth_all_customers" on public.customers for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_stock_movements" on public.stock_movements;
create policy "auth_all_stock_movements" on public.stock_movements for all to authenticated using (true) with check (true);

-- =====================================================================
-- Seguridad (RLS)
-- ---------------------------------------------------------------------
-- Storefront público: cualquiera puede LEER (rol anon).
-- Escritura sólo para usuarios autenticados (panel admin con login).
-- La service_role (Edge Functions / server) saltea RLS siempre.
-- =====================================================================
alter table public.settings    enable row level security;
alter table public.products    enable row level security;
alter table public.collections enable row level security;
alter table public.lookbook    enable row level security;
alter table public.drops       enable row level security;

-- settings
drop policy if exists "public_read_settings" on public.settings;
create policy "public_read_settings" on public.settings for select using (true);
drop policy if exists "auth_write_settings" on public.settings;
create policy "auth_write_settings" on public.settings for all to authenticated using (true) with check (true);

-- products
drop policy if exists "public_read_products" on public.products;
create policy "public_read_products" on public.products for select using (true);
drop policy if exists "auth_write_products" on public.products;
create policy "auth_write_products" on public.products for all to authenticated using (true) with check (true);

-- collections
drop policy if exists "public_read_collections" on public.collections;
create policy "public_read_collections" on public.collections for select using (true);
drop policy if exists "auth_write_collections" on public.collections;
create policy "auth_write_collections" on public.collections for all to authenticated using (true) with check (true);

-- lookbook
drop policy if exists "public_read_lookbook" on public.lookbook;
create policy "public_read_lookbook" on public.lookbook for select using (true);
drop policy if exists "auth_write_lookbook" on public.lookbook;
create policy "auth_write_lookbook" on public.lookbook for all to authenticated using (true) with check (true);

-- drops
drop policy if exists "public_read_drops" on public.drops;
create policy "public_read_drops" on public.drops for select using (true);
drop policy if exists "auth_write_drops" on public.drops;
create policy "auth_write_drops" on public.drops for all to authenticated using (true) with check (true);

-- Permisos a nivel de rol (RLS sigue gobernando el acceso por fila)
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

-- =====================================================================
-- Trigger: mantener settings.updated_at al día
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch
  before update on public.settings
  for each row execute function public.touch_updated_at();
