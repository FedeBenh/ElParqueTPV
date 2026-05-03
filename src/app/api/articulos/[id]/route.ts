import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { actualizarArticulo } from '../../../../lib/actions'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const art = await prisma.articulo.findUnique({ where: { id } })
  if (!art) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(art)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await req.json()
    const updated = await actualizarArticulo(id, body)
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const art = await prisma.articulo.findUnique({ where: { id } })
    if (!art) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    const updated = await prisma.articulo.update({ where: { id }, data: { activo: !art.activo } })
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
