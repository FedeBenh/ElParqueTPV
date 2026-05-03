import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const venta = await prisma.venta.findUnique({ where: { id }, include: { lineas: { include: { articulo: true } } } })
  if (!venta) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(venta)
}
