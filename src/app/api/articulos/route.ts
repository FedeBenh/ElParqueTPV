import { NextResponse } from 'next/server'
import { listarArticulos, crearArticulo } from '../../../lib/actions'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') || undefined
  try {
    const list = await listarArticulos(q)
    return NextResponse.json(list)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const art = await crearArticulo(body)
    return NextResponse.json(art)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
