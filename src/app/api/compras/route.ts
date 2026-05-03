import { NextResponse } from 'next/server'
import { crearCompra } from '../../../lib/actions'
import { prisma } from '../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const compra = await crearCompra(body)
    return NextResponse.json(compra)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const desde = url.searchParams.get('desde')
  const hasta = url.searchParams.get('hasta')
  const where: any = {}
  if (desde || hasta) where.fecha = {}
  if (desde) where.fecha.gte = new Date(desde as string)
  if (hasta) where.fecha.lte = new Date(hasta as string)
  const list = await prisma.compra.findMany({ where, orderBy: { fecha: 'desc' }, include: { lineas: true } })
  return NextResponse.json(list)
}
