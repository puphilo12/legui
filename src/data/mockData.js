// =====================================================================
// Datos de ejemplo (MODO MOCK).
// Misma forma que tendrán las tablas de Supabase, así el cambio a la
// base real es transparente. Las imágenes son placeholders de picsum
// (siempre cargan) — reemplazalas desde el panel admin o por las reales.
// =====================================================================

const img = (seed, w = 800, h = 1000) =>
  `https://picsum.photos/seed/legui-${seed}/${w}/${h}`

export const MOCK_SETTINGS = {
  store_id: 'legui',
  brand: 'LEGUI',
  slogan_title: 'Ropa y\nzapatillas\npara la calle',
  slogan_subtitle:
    'Streetwear sin reglas. Drops semanales, ediciones limitadas y siluetas que mueven la ciudad. Hecho para los que no esperan turno.',
  hero_badge: 'Temporada 26 · En vivo',
  hero_image: img('hero', 900, 1100),
  whatsapp: '5491100000000', // <-- número real del negocio (sin +)
  instagram: 'legui',
  tiktok: 'legui',
  free_shipping_threshold: 80000,
  marquee:
    'NUEVO DROP ✸ ENVÍO GRATIS +$80.000 ✸ EDICIONES LIMITADAS ✸ STREETWEAR ✸ LEGUI ✸ ',
  drop_marquee:
    'VIERNES 20:00 ✸ HASTA -40% ✸ SOLO 100 UNIDADES ✸ NO TE DUERMAS ✸ ',
  mp_public_key: '',
}

export const MOCK_PRODUCTS = [
  {
    id: 'p1',
    store_id: 'legui',
    name: 'Runner 2099',
    category: 'Zapatillas',
    price: 129000,
    discount_price: null,
    tag: 'Nuevo',
    sold_out: false,
    featured: true,
    is_offer: false,
    description:
      'Silueta runner con suela chunky y upper técnico. Liviana, comoda y lista para la ciudad.',
    image: img('runner-a'),
    images: [img('runner-a'), img('runner-b'), img('runner-c')],
    colors: [
      { name: 'Negro', hex: '#111114', image: img('runner-a') },
      { name: 'Azul', hex: '#1B3FE0', image: img('runner-b') },
    ],
    sizes: ['38', '39', '40', '41', '42', '43'],
    stock: 24,
  },
  {
    id: 'p2',
    store_id: 'legui',
    name: 'Static Oversize Hoodie',
    category: 'Ropa',
    price: 79000,
    discount_price: 59000,
    tag: 'Top',
    sold_out: false,
    featured: true,
    is_offer: true,
    description: 'Hoodie oversize de frisa pesada. Calce holgado, capucha doble.',
    image: img('hoodie-a'),
    images: [img('hoodie-a'), img('hoodie-b')],
    colors: [
      { name: 'Gris', hex: '#3a3a40', image: img('hoodie-a') },
      { name: 'Negro', hex: '#111114', image: img('hoodie-b') },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 40,
  },
  {
    id: 'p3',
    store_id: 'legui',
    name: 'Court Mono',
    category: 'Zapatillas',
    price: 99000,
    discount_price: null,
    tag: 'Drop',
    sold_out: true,
    featured: false,
    is_offer: false,
    description: 'Clásica de cancha monocromática. Edición agotada — vuelve en el próximo drop.',
    image: img('court-a'),
    images: [img('court-a'), img('court-b')],
    colors: [{ name: 'Blanco', hex: '#f4f4f5', image: img('court-a') }],
    sizes: ['39', '40', '41', '42'],
    stock: 0,
  },
  {
    id: 'p4',
    store_id: 'legui',
    name: 'Tactical Cargo',
    category: 'Ropa',
    price: 89000,
    discount_price: null,
    tag: 'Nuevo',
    sold_out: false,
    featured: false,
    is_offer: false,
    description: 'Pantalón cargo de gabardina con bolsillos utilitarios y ajuste en tobillo.',
    image: img('cargo-a'),
    images: [img('cargo-a'), img('cargo-b')],
    colors: [
      { name: 'Verde', hex: '#3f4a2e', image: img('cargo-a') },
      { name: 'Negro', hex: '#111114', image: img('cargo-b') },
    ],
    sizes: ['38', '40', '42', '44'],
    stock: 18,
  },
  {
    id: 'p5',
    store_id: 'legui',
    name: 'Blue Bolt',
    category: 'Zapatillas',
    price: 139000,
    discount_price: null,
    tag: 'Edición',
    sold_out: false,
    featured: true,
    is_offer: false,
    description: 'Edición limitada en azul eléctrico. Numeradas, 100 pares.',
    image: img('bolt-a'),
    images: [img('bolt-a'), img('bolt-b'), img('bolt-c')],
    colors: [{ name: 'Azul', hex: '#1B3FE0', image: img('bolt-a') }],
    sizes: ['40', '41', '42', '43'],
    stock: 12,
  },
  {
    id: 'p6',
    store_id: 'legui',
    name: 'Noise Graphic Tee',
    category: 'Ropa',
    price: 39000,
    discount_price: null,
    tag: 'Top',
    sold_out: false,
    featured: false,
    is_offer: false,
    description: 'Remera de algodón pesado con estampa frontal de gran tamaño.',
    image: img('tee-a'),
    images: [img('tee-a'), img('tee-b')],
    colors: [
      { name: 'Negro', hex: '#111114', image: img('tee-a') },
      { name: 'Crema', hex: '#e8e2d4', image: img('tee-b') },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 60,
  },
]

export const MOCK_COLLECTIONS = [
  {
    id: 'c1',
    store_id: 'legui',
    title: 'Zapatillas',
    subtitle: '82 modelos',
    image: img('col-zapas', 900, 1200),
    big: true,
  },
  {
    id: 'c2',
    store_id: 'legui',
    title: 'Hoodies & Ropa',
    subtitle: 'Ver todo',
    image: img('col-hoodies', 800, 600),
    big: false,
  },
  {
    id: 'c3',
    store_id: 'legui',
    title: 'Accesorios',
    subtitle: 'Ver todo',
    image: img('col-acc', 800, 600),
    big: false,
  },
]

export const MOCK_LOOKBOOK = [
  { id: 'lb1', store_id: 'legui', title: 'Look 01', image: img('look-1', 700, 1000), span: 'tall', sort: 1 },
  { id: 'lb2', store_id: 'legui', title: 'Look 02', image: img('look-2', 700, 600), span: 'normal', sort: 2 },
  { id: 'lb3', store_id: 'legui', title: 'Look 03', image: img('look-3', 700, 600), span: 'normal', sort: 3 },
  { id: 'lb4', store_id: 'legui', title: 'Look 04', image: img('look-4', 700, 1000), span: 'tall', sort: 4 },
  { id: 'lb5', store_id: 'legui', title: 'Look 05', image: img('look-5', 1200, 600), span: 'wide', sort: 5 },
  { id: 'lb6', store_id: 'legui', title: 'Look 06', image: img('look-6', 700, 600), span: 'normal', sort: 6 },
]

// Drop activo: próximo viernes 20:00 se calcula en runtime si starts_at es null.
export const MOCK_DROPS = [
  {
    id: 'd1',
    store_id: 'legui',
    title: 'Hasta -40%\nen el drop',
    subtitle: 'Drop semanal · Viernes 20:00',
    description:
      'Suscribite y recibí el código antes que nadie. Sin spam, solo fuego.',
    image: img('drop-1', 900, 1100),
    discount: 40,
    units: 100,
    starts_at: null, // null = próximo viernes 20:00 (auto)
    active: true,
  },
]
