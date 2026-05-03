import { NextResponse } from 'next/server'
import { crearCategoria, listarCategorias } from '../../../lib/actions'

export async function GET() {
  try {
    const list = await listarCategorias()
    return NextResponse.json(list)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const c = await crearCategoria(body)
    return NextResponse.json(c)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
