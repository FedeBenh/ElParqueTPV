import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.articulo.createMany({
    data: [
      {
        codigo: '1001',
        nombre: 'Pan',
        descripcion: 'Pan fresco',
        categoria: 'Panadería',
        precioCompra: 0.30,
        precioVenta: 0.60,
        stockActual: 100,
        stockMinimo: 10,
        activo: true
      },
      {
        codigo: '1002',
        nombre: 'Leche',
        descripcion: 'Leche entera',
        categoria: 'Lácteos',
        precioCompra: 0.50,
        precioVenta: 1.00,
        stockActual: 50,
        stockMinimo: 5,
        activo: true
      },
      {
        codigo: '1003',
        nombre: 'Huevos',
        descripcion: 'Docena de huevos',
        categoria: 'Huevos',
        precioCompra: 1.20,
        precioVenta: 2.00,
        stockActual: 30,
        stockMinimo: 5,
        activo: true
      }
    ]
  })
}

main().catch(e => {
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
