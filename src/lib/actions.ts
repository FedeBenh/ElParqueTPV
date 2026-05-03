import { prisma } from './prisma'
import { articuloSchema, articuloUpdateSchema, compraSchema, ventaSchema, categoriaSchema, cajaAperturaSchema, cajaCierreSchema, cajaMovimientoSchema } from './schemas'
import { Prisma } from '@prisma/client'

export async function crearArticulo(data: any) {
  // accept imagenBase64 or imagenUrl
  if (data?.imagenBase64 && !data.imagenUrl) data.imagenUrl = data.imagenBase64
  if (data?.imagenBase64) delete data.imagenBase64
  const parsed = articuloSchema.parse(data)
  const allowed = ['codigo','nombre','descripcion','categoria','categoriaId','imagenUrl','precioCompra','precioVenta','stockActual','stockMinimo','activo'] as const
  const createData: any = {}
  for (const k of allowed) {
    // @ts-ignore
    if (parsed[k] !== undefined) createData[k] = parsed[k]
  }
  return prisma.articulo.create({ data: createData })
}

export async function actualizarArticulo(id: number, data: any) {
  if (data?.imagenBase64 && !data.imagenUrl) data.imagenUrl = data.imagenBase64
  if (data?.imagenBase64) delete data.imagenBase64
  const parsed = articuloUpdateSchema.parse(data)
  const allowed = ['codigo','nombre','descripcion','categoria','categoriaId','imagenUrl','precioCompra','precioVenta','stockActual','stockMinimo','activo'] as const
  const updateData: any = {}
  for (const k of allowed) {
    // @ts-ignore
    if (parsed[k] !== undefined) updateData[k] = parsed[k]
  }
  return prisma.articulo.update({ where: { id }, data: updateData })
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

export async function buscarArticulosTPV(q?: string, categoriaId?: number) {
  const txt = q?.trim() || ''
  const where: any = {
    activo: true
  }
  if (txt.length > 0) {
    where.OR = [
      { codigo: { contains: txt, mode: Prisma.QueryMode.insensitive } },
      { nombre: { contains: txt, mode: Prisma.QueryMode.insensitive } },
      { descripcion: { contains: txt, mode: Prisma.QueryMode.insensitive } },
      { categoria: { contains: txt, mode: Prisma.QueryMode.insensitive } },
      { categoriaRel: { nombre: { contains: txt, mode: Prisma.QueryMode.insensitive } } }
    ]
  }
  if (categoriaId) where.categoriaId = categoriaId
  return prisma.articulo.findMany({ where, take: 50, orderBy: { nombre: 'asc' }, include: { categoriaRel: true } })
}

export async function crearCategoria(data: any) {
  const parsed = categoriaSchema.parse(data)
  return prisma.categoria.create({ data: parsed })
}

export async function listarCategorias() {
  return prisma.categoria.findMany({ where: { activa: true }, orderBy: { orden: 'asc' } })
}

export async function abrirCajaSesion(data: any) {
  const parsed = cajaAperturaSchema.parse(data)
  const abierta = await prisma.cajaSesion.findFirst({ where: { estado: 'ABIERTA' } })
  if (abierta) throw new Error('Ya hay una caja abierta')
  return prisma.cajaSesion.create({ data: { efectivoInicial: parsed.efectivoInicial, observacionesApertura: parsed.observacionesApertura } })
}

export async function listarCajaSesiones() {
  return prisma.cajaSesion.findMany({ orderBy: { fechaApertura: 'desc' }, include: { denominaciones: true, movimientos: true } })
}

export async function getCajaSesion(id: number) {
  return prisma.cajaSesion.findUnique({ where: { id }, include: { denominaciones: true, movimientos: true, ventas: true } })
}

export async function addCajaMovimiento(data: any) {
  const parsed = cajaMovimientoSchema.parse(data)
  const caja = await prisma.cajaSesion.findUnique({ where: { id: parsed.cajaSesionId } })
  if (!caja) throw new Error('Caja no encontrada')
  return prisma.cajaMovimiento.create({ data: { cajaSesionId: parsed.cajaSesionId, tipo: parsed.tipo as any, concepto: parsed.concepto, importe: parsed.importe, observaciones: parsed.observaciones } })
}

export async function cerrarCajaSesion(payload: any) {
  const parsed = cajaCierreSchema.parse(payload)
  const caja = await prisma.cajaSesion.findUnique({ where: { id: parsed.cajaSesionId }, include: { movimientos: true, ventas: true } })
  if (!caja) throw new Error('Caja no encontrada')
  if (caja.estado !== 'ABIERTA') throw new Error('La caja ya está cerrada')

  const ventasEfectivo = await prisma.venta.aggregate({ where: { cajaSesionId: caja.id, metodoPago: 'EFECTIVO' }, _sum: { totalVenta: true } })
  const ventasEfectivoSum = Number(ventasEfectivo._sum.totalVenta || 0)

  const entradas = caja.movimientos.filter((m) => m.tipo === 'ENTRADA').reduce((s, m) => s + Number(m.importe), 0)
  const salidas = caja.movimientos.filter((m) => m.tipo === 'SALIDA').reduce((s, m) => s + Number(m.importe), 0)

  const efectivoEsperado = Number(caja.efectivoInicial) + ventasEfectivoSum + entradas - salidas

  let efectivoContado = 0
  for (const d of parsed.denominaciones) {
    efectivoContado += d.valor * d.cantidad
  }

  const diferencia = Number((efectivoContado - efectivoEsperado).toFixed(2))

  return prisma.$transaction(async (tx) => {
    await tx.cajaDenominacion.createMany({ data: parsed.denominaciones.map((d: any) => ({ cajaSesionId: parsed.cajaSesionId, tipo: d.tipo as any, valor: d.valor, cantidad: d.cantidad, total: Number((d.valor * d.cantidad).toFixed(2)) })) })
    const updated = await tx.cajaSesion.update({ where: { id: parsed.cajaSesionId }, data: { fechaCierre: new Date(), efectivoEsperado, efectivoContado, diferencia, estado: 'CERRADA', observacionesCierre: parsed.observacionesCierre } })
    return updated
  })
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
    const cajaAbierta = await tx.cajaSesion.findFirst({ where: { estado: 'ABIERTA' } })
    const venta = await tx.venta.create({ data: { fecha: new Date(), totalVenta: total, metodoPago: parsed.metodoPago, observaciones: parsed.observaciones, cajaSesionId: cajaAbierta ? cajaAbierta.id : undefined } })
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
