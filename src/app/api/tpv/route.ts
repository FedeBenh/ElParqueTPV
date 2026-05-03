import { NextResponse } from 'next/server'
import { buscarArticulosTPV } from '../../../lib/actions'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') || ''
  const categoria = url.searchParams.get('categoriaId')
  const categoriaId = categoria ? Number(categoria) : undefined
  const list = await buscarArticulosTPV(q, categoriaId)
  return NextResponse.json(list)
}
