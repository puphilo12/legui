-- Descuento mayorista automático: si el carrito junta N o más unidades de una
-- categoría, esas unidades llevan X% OFF. Se configura en Admin → Contenido.
-- Idempotente: se puede correr más de una vez.

-- Limpieza del sistema de códigos que se probó y se descartó (tabla vacía).
drop function if exists public.validate_coupon(text);
drop table if exists public.coupons;
alter table public.orders drop column if exists coupon_code;
alter table public.orders drop column if exists coupon_percent;

alter table public.settings add column if not exists bulk_enabled   boolean not null default false;
alter table public.settings add column if not exists bulk_category  text             default 'Accesorios';
alter table public.settings add column if not exists bulk_min_units integer not null default 10 check (bulk_min_units >= 2);
alter table public.settings add column if not exists bulk_percent   integer not null default 28 check (bulk_percent between 1 and 100);

-- Qué descuento por cantidad llevó cada pedido (para el mensaje y las métricas).
alter table public.orders add column if not exists bulk_percent  integer;
alter table public.orders add column if not exists bulk_discount integer;

update public.settings set bulk_enabled = true where store_id = 'legui';
