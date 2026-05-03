import { NextResponse } from 'next/server'
import { getCajaSesion, addCajaMovimiento } from '../../../../lib/actions'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const caja = await getCajaSesion(id)
    return NextResponse.json(caja)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const id = Number(params.id)
    body.cajaSesionId = id
    const mov = await addCajaMovimiento(body)
    return NextResponse.json(mov)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
