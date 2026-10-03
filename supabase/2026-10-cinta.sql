-- Cinta animada (marquee) editable desde Admin → Contenido.
-- `marquee` y `drop_marquee` ya existían: guardan un mensaje por renglón.
alter table public.settings add column if not exists marquee_style text not null default 'azul'
  check (marquee_style in ('azul', 'negro', 'plateado'));
