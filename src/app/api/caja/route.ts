import { NextResponse } from 'next/server'
import { listarCajaSesiones } from '../../../lib/actions'

export async function GET() {
  try {
    const list = await listarCajaSesiones()
    return NextResponse.json(list)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
