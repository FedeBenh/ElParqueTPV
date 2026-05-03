import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.categoria.createMany({ data: [
    { nombre: 'Bebidas', descripcion: 'Refrescos y bebidas', orden: 1 },
    { nombre: 'Panadería', descripcion: 'Pan y bollería', orden: 2 },
    { nombre: 'Lácteos', descripcion: 'Leches y derivados', orden: 3 },
    { nombre: 'Fruta y verdura', descripcion: 'Frescos', orden: 4 },
    { nombre: 'Congelados', descripcion: 'Productos congelados', orden: 5 },
    { nombre: 'Limpieza', descripcion: 'Productos limpieza', orden: 6 }
  ], skipDuplicates: true })

  const categorias = await prisma.categoria.findMany()
  const cat = (name: string) => categorias.find((c) => c.nombre === name)?.id

  await prisma.articulo.createMany({ data: [
    { codigo: '1001', nombre: 'Pan', descripcion: 'Pan fresco', categoria: 'Panadería', categoriaId: cat('Panadería') || undefined, imagenUrl: 'https://via.placeholder.com/200x150?text=Pan', precioCompra: 0.3, precioVenta: 0.6, stockActual: 100, stockMinimo: 10, activo: true },
    { codigo: '1002', nombre: 'Leche', descripcion: 'Leche entera', categoria: 'Lácteos', categoriaId: cat('Lácteos') || undefined, imagenUrl: 'https://via.placeholder.com/200x150?text=Leche', precioCompra: 0.5, precioVenta: 1.0, stockActual: 50, stockMinimo: 5, activo: true },
    { codigo: '1003', nombre: 'Huevos', descripcion: 'Docena de huevos', categoria: 'Panadería', categoriaId: cat('Panadería') || undefined, imagenUrl: 'https://via.placeholder.com/200x150?text=Huevos', precioCompra: 1.2, precioVenta: 2.0, stockActual: 30, stockMinimo: 5, activo: true },
    { codigo: '2001', nombre: 'Coca-Cola 1L', descripcion: 'Refresco 1 litro', categoria: 'Bebidas', categoriaId: cat('Bebidas') || undefined, imagenUrl: 'https://via.placeholder.com/200x150?text=Coca-Cola', precioCompra: 0.8, precioVenta: 1.5, stockActual: 80, stockMinimo: 10, activo: true },
    { codigo: '3001', nombre: 'Manzana', descripcion: 'Manzana roja por kg', categoria: 'Fruta y verdura', categoriaId: cat('Fruta y verdura') || undefined, imagenUrl: 'https://via.placeholder.com/200x150?text=Manzana', precioCompra: 0.7, precioVenta: 1.5, stockActual: 40, stockMinimo: 5, activo: true }
  ], skipDuplicates: true })

  // create an example closed caja only if not exists
  const existing = await prisma.cajaSesion.findFirst({ where: { observacionesApertura: 'Caja ejemplo seed' } })
  if (!existing) {
    const caja = await prisma.cajaSesion.create({ data: { efectivoInicial: 100.0, efectivoEsperado: 0.0, efectivoContado: 0.0, diferencia: 0.0, estado: 'CERRADA', observacionesApertura: 'Caja ejemplo seed', observacionesCierre: 'Cierre seed' } })

    await prisma.cajaDenominacion.createMany({ data: [
      { cajaSesionId: caja.id, tipo: 'BILLETE', valor: 50.0, cantidad: 1, total: 50.0 },
      { cajaSesionId: caja.id, tipo: 'MONEDA', valor: 2.0, cantidad: 10, total: 20.0 }
    ], skipDuplicates: true })

    await prisma.cajaMovimiento.createMany({ data: [
      { cajaSesionId: caja.id, tipo: 'ENTRADA', concepto: 'Ajuste seed', importe: 10.0 },
      { cajaSesionId: caja.id, tipo: 'SALIDA', concepto: 'Reembolso seed', importe: 5.0 }
    ], skipDuplicates: true })
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
