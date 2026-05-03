import { NextResponse } from 'next/server'
import { cerrarCajaSesion } from '../../../../lib/actions'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const res = await cerrarCajaSesion(body)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
