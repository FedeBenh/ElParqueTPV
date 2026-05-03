import { NextResponse } from 'next/server'
import { buscarArticulosTPV } from '../../../lib/actions'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') || ''
  const list = await buscarArticulosTPV(q)
  return NextResponse.json(list)
}
