import { NextResponse } from 'next/server'
import { abrirCajaSesion } from '../../../../lib/actions'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const caja = await abrirCajaSesion(body)
    return NextResponse.json(caja)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
