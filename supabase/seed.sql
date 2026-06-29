-- =====================================================================
-- LEGUI · Datos de ejemplo (seed)
-- Reproduce exactamente el MODO MOCK (src/data/mockData.js), así la
-- tienda se ve igual al conectar Supabase. Ejecutar DESPUÉS de schema.sql.
-- Las imágenes son placeholders de picsum: reemplazalas por las reales.
-- Re-ejecutable: usa ON CONFLICT para no duplicar.
-- =====================================================================

begin;

-- ---- settings ----
insert into public.settings (
  store_id, brand, slogan_title, slogan_subtitle, hero_badge, hero_image,
  whatsapp, instagram, tiktok, free_shipping_threshold, marquee, drop_marquee, mp_public_key
) values (
  'legui',
  'LEGUI',
  E'Ropa y\nzapatillas\npara la calle',
  'Streetwear sin reglas. Drops semanales, ediciones limitadas y siluetas que mueven la ciudad. Hecho para los que no esperan turno.',
  'Temporada 26 · En vivo',
  'https://picsum.photos/seed/legui-hero/900/1100',
  '5491100000000',
  'legui',
  'legui',
  80000,
  'NUEVO DROP ✸ ENVÍO GRATIS +$80.000 ✸ EDICIONES LIMITADAS ✸ STREETWEAR ✸ LEGUI ✸ ',
  'VIERNES 20:00 ✸ HASTA -40% ✸ SOLO 100 UNIDADES ✸ NO TE DUERMAS ✸ ',
  ''
)
on conflict (store_id) do update set
  brand = excluded.brand,
  slogan_title = excluded.slogan_title,
  slogan_subtitle = excluded.slogan_subtitle,
  hero_badge = excluded.hero_badge,
  hero_image = excluded.hero_image,
  whatsapp = excluded.whatsapp,
  instagram = excluded.instagram,
  tiktok = excluded.tiktok,
  free_shipping_threshold = excluded.free_shipping_threshold,
  marquee = excluded.marquee,
  drop_marquee = excluded.drop_marquee;

-- ---- products ----
insert into public.products
  (id, store_id, name, category, price, discount_price, tag, sold_out, featured, is_offer, description, image, images, colors, sizes, stock, sort)
values
  ('p1','legui','Runner 2099','Zapatillas',129000,null,'Nuevo',false,true,false,
   'Silueta runner con suela chunky y upper técnico. Liviana, comoda y lista para la ciudad.',
   'https://picsum.photos/seed/legui-runner-a/800/1000',
   '["https://picsum.photos/seed/legui-runner-a/800/1000","https://picsum.photos/seed/legui-runner-b/800/1000","https://picsum.photos/seed/legui-runner-c/800/1000"]'::jsonb,
   '[{"name":"Negro","hex":"#111114","image":"https://picsum.photos/seed/legui-runner-a/800/1000"},{"name":"Azul","hex":"#1B3FE0","image":"https://picsum.photos/seed/legui-runner-b/800/1000"}]'::jsonb,
   '["38","39","40","41","42","43"]'::jsonb, 24, 1),

  ('p2','legui','Static Oversize Hoodie','Ropa',79000,59000,'Top',false,true,true,
   'Hoodie oversize de frisa pesada. Calce holgado, capucha doble.',
   'https://picsum.photos/seed/legui-hoodie-a/800/1000',
   '["https://picsum.photos/seed/legui-hoodie-a/800/1000","https://picsum.photos/seed/legui-hoodie-b/800/1000"]'::jsonb,
   '[{"name":"Gris","hex":"#3a3a40","image":"https://picsum.photos/seed/legui-hoodie-a/800/1000"},{"name":"Negro","hex":"#111114","image":"https://picsum.photos/seed/legui-hoodie-b/800/1000"}]'::jsonb,
   '["S","M","L","XL"]'::jsonb, 40, 2),

  ('p3','legui','Court Mono','Zapatillas',99000,null,'Drop',true,false,false,
   'Clásica de cancha monocromática. Edición agotada — vuelve en el próximo drop.',
   'https://picsum.photos/seed/legui-court-a/800/1000',
   '["https://picsum.photos/seed/legui-court-a/800/1000","https://picsum.photos/seed/legui-court-b/800/1000"]'::jsonb,
   '[{"name":"Blanco","hex":"#f4f4f5","image":"https://picsum.photos/seed/legui-court-a/800/1000"}]'::jsonb,
   '["39","40","41","42"]'::jsonb, 0, 3),

  ('p4','legui','Tactical Cargo','Ropa',89000,null,'Nuevo',false,false,false,
   'Pantalón cargo de gabardina con bolsillos utilitarios y ajuste en tobillo.',
   'https://picsum.photos/seed/legui-cargo-a/800/1000',
   '["https://picsum.photos/seed/legui-cargo-a/800/1000","https://picsum.photos/seed/legui-cargo-b/800/1000"]'::jsonb,
   '[{"name":"Verde","hex":"#3f4a2e","image":"https://picsum.photos/seed/legui-cargo-a/800/1000"},{"name":"Negro","hex":"#111114","image":"https://picsum.photos/seed/legui-cargo-b/800/1000"}]'::jsonb,
   '["38","40","42","44"]'::jsonb, 18, 4),

  ('p5','legui','Blue Bolt','Zapatillas',139000,null,'Edición',false,true,false,
   'Edición limitada en azul eléctrico. Numeradas, 100 pares.',
   'https://picsum.photos/seed/legui-bolt-a/800/1000',
   '["https://picsum.photos/seed/legui-bolt-a/800/1000","https://picsum.photos/seed/legui-bolt-b/800/1000","https://picsum.photos/seed/legui-bolt-c/800/1000"]'::jsonb,
   '[{"name":"Azul","hex":"#1B3FE0","image":"https://picsum.photos/seed/legui-bolt-a/800/1000"}]'::jsonb,
   '["40","41","42","43"]'::jsonb, 12, 5),

  ('p6','legui','Noise Graphic Tee','Ropa',39000,null,'Top',false,false,false,
   'Remera de algodón pesado con estampa frontal de gran tamaño.',
   'https://picsum.photos/seed/legui-tee-a/800/1000',
   '["https://picsum.photos/seed/legui-tee-a/800/1000","https://picsum.photos/seed/legui-tee-b/800/1000"]'::jsonb,
   '[{"name":"Negro","hex":"#111114","image":"https://picsum.photos/seed/legui-tee-a/800/1000"},{"name":"Crema","hex":"#e8e2d4","image":"https://picsum.photos/seed/legui-tee-b/800/1000"}]'::jsonb,
   '["S","M","L","XL"]'::jsonb, 60, 6)
on conflict (id) do nothing;

-- ---- collections ----
insert into public.collections (id, store_id, title, subtitle, image, big, sort) values
  ('c1','legui','Zapatillas','82 modelos','https://picsum.photos/seed/legui-col-zapas/900/1200',true,1),
  ('c2','legui','Hoodies & Ropa','Ver todo','https://picsum.photos/seed/legui-col-hoodies/800/600',false,2),
  ('c3','legui','Accesorios','Ver todo','https://picsum.photos/seed/legui-col-acc/800/600',false,3)
on conflict (id) do nothing;

-- ---- lookbook ----
insert into public.lookbook (id, store_id, title, image, span, sort) values
  ('lb1','legui','Look 01','https://picsum.photos/seed/legui-look-1/700/1000','tall',1),
  ('lb2','legui','Look 02','https://picsum.photos/seed/legui-look-2/700/600','normal',2),
  ('lb3','legui','Look 03','https://picsum.photos/seed/legui-look-3/700/600','normal',3),
  ('lb4','legui','Look 04','https://picsum.photos/seed/legui-look-4/700/1000','tall',4),
  ('lb5','legui','Look 05','https://picsum.photos/seed/legui-look-5/1200/600','wide',5),
  ('lb6','legui','Look 06','https://picsum.photos/seed/legui-look-6/700/600','normal',6)
on conflict (id) do nothing;

-- ---- drops ----
insert into public.drops (id, store_id, title, subtitle, description, image, discount, units, starts_at, active) values
  ('d1','legui',
   E'Hasta -40%\nen el drop',
   'Drop semanal · Viernes 20:00',
   'Suscribite y recibí el código antes que nadie. Sin spam, solo fuego.',
   'https://picsum.photos/seed/legui-drop-1/900/1100',
   40, 100, null, true)
on conflict (id) do nothing;

commit;
