# LEGUI · Base de datos (Supabase)

La app funciona **sin base** (modo mock con datos de ejemplo). Cuando quieras
datos reales y persistentes, conectá Supabase con estos pasos.

## 1. Crear el proyecto

1. Entrá a [supabase.com](https://supabase.com) → **New project**.
2. Elegí nombre, contraseña de la base y región (la más cercana, ej. `South America (São Paulo)`).

## 2. Crear las tablas

1. En el panel: **SQL Editor → New query**.
2. Pegá el contenido de [`schema.sql`](./schema.sql) y dale **Run**.
3. Nueva query: pegá [`seed.sql`](./seed.sql) y **Run** (carga los productos de ejemplo).

> `schema.sql` crea las tablas `settings`, `products`, `collections`, `lookbook`, `drops`,
> los índices y las políticas de seguridad (RLS): **lectura pública**, **escritura sólo logueado**.

## 3. Conectar la app

1. En Supabase: **Project Settings → API**. Copiá:
   - **Project URL**
   - **anon public key**
2. En la raíz del proyecto, copiá `.env.example` a `.env` y completá:

   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_STORE_ID=legui
   ```

3. Reiniciá el dev server (`Ctrl+C` y `npm run dev`). En consola debería dejar de
   aparecer "MODO MOCK".

## Estructura

| Tabla              | Para qué                                                         |
| ------------------ | --------------------------------------------------------------- |
| `settings`         | Marca, slogan, hero, banner, WhatsApp, alias/CBU, envío gratis  |
| `products`         | Catálogo: precio, oferta, stock, costo, mínimo, talles, colores |
| `collections`      | Bento de colecciones del home                                   |
| `lookbook`         | Grilla editorial del home                                       |
| `drops`            | Lanzamientos con cuenta regresiva                               |
| `orders`           | Pedidos web + ventas de mostrador (POS)                         |
| `expenses`         | Gastos (alquiler, servicios, mercadería…)                       |
| `customers`        | Cuenta corriente / fiado: saldo e historial por cliente         |
| `stock_movements`  | Reposiciones e inversión (COGS)                                 |

> Las 4 tablas de back-office (`orders`, `expenses`, `customers`, `stock_movements`)
> son **sólo para usuarios autenticados** (RLS). El panel `/admin` hoy guarda en
> el navegador (localStorage); para escribir en la base real falta sumar login
> con Supabase Auth y marcar tu usuario como admin.

Todo es **multi-tienda** por `store_id` (poné otro id en `VITE_STORE_ID` y cargá
otra fila en `settings` para una segunda tienda en la misma base).

## Imágenes

El seed usa placeholders de [picsum.photos](https://picsum.photos). Para las fotos
reales, lo más cómodo es **Supabase Storage**: creá un bucket público (ej. `media`),
subí las imágenes y pegá sus URLs en la columna `image` / `images` de cada producto.

## Notas de seguridad

- La `anon key` es pública (va en el front): por eso la escritura está bloqueada por RLS.
  Para que el **panel admin** escriba en la base real vas a necesitar login
  (Supabase Auth) — hoy el admin guarda en el navegador (localStorage).
- Para cobrar con **MercadoPago**, el `access_token` va en una **Edge Function**
  (secret del servidor), nunca en el `.env` del front. El `VITE_MP_PUBLIC_KEY` sí es público.
