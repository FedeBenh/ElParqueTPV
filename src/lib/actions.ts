import { prisma } from './prisma'
import { articuloSchema, articuloUpdateSchema, compraSchema, ventaSchema } from './schemas'

export async function crearArticulo(data: any) {
  const parsed = articuloSchema.parse(data)
  return prisma.articulo.create({ data: parsed })
}

export async function actualizarArticulo(id: number, data: any) {
  const parsed = articuloUpdateSchema.parse(data)
  return prisma.articulo.update({ where: { id }, data: parsed })
}

export async function listarArticulos(q?: string) {
  const where: any = q
    ? {
        OR: [
          { codigo: { contains: q } },
          { nombre: { contains: q } }
        ]
      }
    : {}
  return prisma.articulo.findMany({ where, orderBy: { nombre: 'asc' } })
}

export async function buscarArticulosTPV(q: string) {
  const where: any = {
    activo: true,
    OR: [
      { codigo: { contains: q } },
      { nombre: { contains: q } }
    ]
  }
  return prisma.articulo.findMany({ where, take: 20, orderBy: { nombre: 'asc' } })
}

export async function crearCompra(payload: any) {
  const parsed = compraSchema.parse(payload)
  const total = parsed.lineas.reduce((s, l) => s + l.cantidad * l.precioCompra, 0)
  return prisma.$transaction(async (tx) => {
    const compra = await tx.compra.create({ data: { fecha: new Date(), proveedor: parsed.proveedor, totalCompra: total, observaciones: parsed.observaciones } })
    for (const l of parsed.lineas) {
      const subtotal = l.cantidad * l.precioCompra
      await tx.compraLinea.create({ data: { compraId: compra.id, articuloId: l.articuloId, cantidad: l.cantidad, precioCompra: l.precioCompra, subtotal } })
      await tx.movimientoStock.create({ data: { articuloId: l.articuloId, tipo: 'ENTRADA', cantidad: l.cantidad, referencia: `COMPRA:${compra.id}` } })
      await tx.articulo.update({ where: { id: l.articuloId }, data: { stockActual: { increment: l.cantidad }, precioCompra: l.precioCompra } })
    }
    return compra
  })
}

export async function crearVenta(payload: any) {
  const parsed = ventaSchema.parse(payload)
  const articuloIds = parsed.lineas.map((l) => l.articuloId)
  const articulos = await prisma.articulo.findMany({ where: { id: { in: articuloIds } } })
  const articuloMap = new Map(articulos.map((a) => [a.id, a]))
  for (const l of parsed.lineas) {
    const art = articuloMap.get(l.articuloId)
    if (!art) throw new Error('Artículo no encontrado')
    if (l.cantidad > art.stockActual) throw new Error(`Stock insuficiente para ${art.nombre}`)
  }
  const total = parsed.lineas.reduce((s, l) => s + l.cantidad * l.precioVenta, 0)
  return prisma.$transaction(async (tx) => {
    const venta = await tx.venta.create({ data: { fecha: new Date(), totalVenta: total, metodoPago: parsed.metodoPago, observaciones: parsed.observaciones } })
    for (const l of parsed.lineas) {
      const subtotal = l.cantidad * l.precioVenta
      await tx.ventaLinea.create({ data: { ventaId: venta.id, articuloId: l.articuloId, cantidad: l.cantidad, precioVenta: l.precioVenta, subtotal } })
      await tx.movimientoStock.create({ data: { articuloId: l.articuloId, tipo: 'SALIDA', cantidad: l.cantidad, referencia: `VENTA:${venta.id}` } })
      await tx.articulo.update({ where: { id: l.articuloId }, data: { stockActual: { decrement: l.cantidad } } })
    }
    return venta
  })
}

export async function obtenerResumen(desde?: string, hasta?: string) {
  const desdeDate = desde ? new Date(desde) : new Date(new Date().setHours(0, 0, 0, 0))
  const hastaDate = hasta ? new Date(hasta) : new Date()
  const ventas = await prisma.venta.findMany({ where: { fecha: { gte: desdeDate, lte: hastaDate } }, include: { lineas: { include: { articulo: true } } } })
  const totalVendido = ventas.reduce((s, v) => s + Number(v.totalVenta), 0)
  const tickets = ventas.length
  const articulos = await prisma.articulo.findMany()
  const articulosBajo = articulos.filter((a) => a.stockActual <= a.stockMinimo)
  const ultimasVentas = await prisma.venta.findMany({ orderBy: { fecha: 'desc' }, take: 5, include: { lineas: { include: { articulo: true } } } })
  const compras = await prisma.compra.findMany({ where: { fecha: { gte: desdeDate, lte: hastaDate } } })
  const totalCompras = compras.reduce((s, c) => s + Number(c.totalCompra), 0)
  const beneficioEstimado = ventas.reduce((sumV, v) => sumV + v.lineas.reduce((s2, l) => s2 + (Number(l.precioVenta) - Number(l.articulo.precioCompra)) * l.cantidad, 0), 0)
  return { ventas, totalVendido, tickets, articulosBajo, ultimasVentas, totalCompras, beneficioEstimado }
}
