# TPV Tienda de Alimentación

Aplicación web para la gestión de ventas, compras y stock en una tienda de alimentación.

## Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Neon/Supabase)
- Zod

## Instalación y uso

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Configura la base de datos:
   - Copia `.env.example` a `.env` y completa `DATABASE_URL` con tu conexión PostgreSQL (Neon/Supabase recomendado).
3. Ejecuta migraciones Prisma (requiere `DATABASE_URL` configurada):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Ejecuta el seed inicial:
   ```bash
   npx prisma db seed
   ```
5. Arranca en local:
   ```bash
   npm run dev
   ```
6. Despliega en Vercel:
   - Sube el proyecto a GitHub y conéctalo a Vercel.
   - Configura la variable `DATABASE_URL` en Vercel.

## Estructura de carpetas
- `/src/app` - Rutas y páginas principales
- `/src/components` - Componentes reutilizables
- `/src/lib` - Utilidades y lógica compartida
- `/prisma` - Schema y seed de Prisma

## Funcionalidades
- Gestión de artículos (CRUD, stock, avisos)
- Compras/Entradas de stock
- Ventas/Salidas de stock
- Vista TPV rápida
- Dashboard/resumen
- Trazabilidad de stock

## Notas
- No incluye autenticación por defecto
- Todos los textos en español
- Código limpio y ordenado
