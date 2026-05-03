import { NextResponse } from 'next/server'
import { obtenerResumen } from '../../../lib/actions'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const desde = url.searchParams.get('desde') || undefined
  const hasta = url.searchParams.get('hasta') || undefined
  const resumen = await obtenerResumen(desde, hasta)
  return NextResponse.json(resumen)
}
