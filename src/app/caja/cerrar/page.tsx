'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const MONEDAS = [0.01,0.02,0.05,0.1,0.2,0.5,1,2]
const BILLETES = [5,10,20,50,100,200,500]

export default function Page() {
  const router = useRouter()
  const [caja, setCaja] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [denoms, setDenoms] = useState<Array<{ tipo: 'MONEDA' | 'BILLETE'; valor: number; cantidad: number }>>([])
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    fetch('/api/caja').then((r) => r.json()).then((data) => {
      const abierta = (data || []).find((c: any) => c.estado === 'ABIERTA')
      setCaja(abierta || null)
      const initial: any[] = []
      MONEDAS.forEach((v) => initial.push({ tipo: 'MONEDA', valor: v, cantidad: 0 }))
      BILLETES.forEach((v) => initial.push({ tipo: 'BILLETE', valor: v, cantidad: 0 }))
      setDenoms(initial)
      setLoading(false)
    }).catch((e) => { setError(String(e)); setLoading(false) })
  }, [])

  function setCantidad(i: number, n: number) {
    setDenoms((d) => d.map((x, idx) => idx === i ? { ...x, cantidad: n } : x))
  }

  function efectivoContado() {
    return denoms.reduce((s, d) => s + d.valor * d.cantidad, 0)
  }

  async function cerrar(e: React.FormEvent) {
    e.preventDefault()
    if (!caja) { setError('No hay caja abierta'); return }
    try {
      const payload = { cajaSesionId: caja.id, denominaciones: denoms.map((d) => ({ tipo: d.tipo, valor: d.valor, cantidad: d.cantidad })), observacionesCierre: observaciones }
      const res = await fetch('/api/caja/cerrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const j = await res.json(); throw new Error(j?.error || 'Error') }
      router.push('/caja')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div>Cargando...</div>

  if (!caja) return <div>No hay caja abierta para cerrar.</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Cerrar caja</h2>
      <form onSubmit={cerrar} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-2">
            <div><strong>Efectivo inicial:</strong> {Number(caja.efectivoInicial).toFixed(2)} €</div>
            <div><strong>Ventas (efectivo):</strong> {Number(caja.ventas?.filter((v:any)=>v.metodoPago==='EFECTIVO').reduce((s:number,v:any)=>s+Number(v.totalVenta||0),0)).toFixed(2)} €</div>
          </div>
        </div>

        <div className="col-span-2">
          <h3 className="font-medium mb-2">Denominaciones</h3>
          <div className="grid grid-cols-4 gap-2">
            {denoms.map((d, i) => (
              <div key={i} className="p-2 border rounded">
                <div className="text-sm text-gray-600">{d.tipo === 'MONEDA' ? 'Moneda' : 'Billete'}</div>
                <div className="font-semibold">{d.valor} €</div>
                <div>
                  <label className="block text-sm mb-1">Cantidad</label>
                  <input type="number" min={0} value={d.cantidad} onChange={(e) => setCantidad(i, Number(e.target.value))} className="border p-1 rounded w-full" />
                </div>
                <div className="mt-2 text-right font-medium">Total: {(d.valor * d.cantidad).toFixed(2)} €</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 text-right">
          <div className="text-2xl font-bold">Efectivo contado: {efectivoContado().toFixed(2)} €</div>
          <div className="text-lg">Efectivo esperado: {(Number(caja.efectivoInicial) + Number(caja.ventas?.filter((v:any)=>v.metodoPago==='EFECTIVO').reduce((s:number,v:any)=>s+Number(v.totalVenta||0),0))).toFixed(2)} €</div>
          <div className="text-lg">Diferencia: {(efectivoContado() - (Number(caja.efectivoInicial) + Number(caja.ventas?.filter((v:any)=>v.metodoPago==='EFECTIVO').reduce((s:number,v:any)=>s+Number(v.totalVenta||0),0)))).toFixed(2)} €</div>
        </div>

        <div className="col-span-2">
          <label className="block text-sm mb-1">Observaciones de cierre</label>
          <input value={observaciones} onChange={(e)=>setObservaciones(e.target.value)} className="border p-2 rounded w-full" />
        </div>

        <div className="col-span-2 flex gap-2 justify-end">
          <button className="bg-red-600 text-white px-4 py-2 rounded">Cerrar caja</button>
          <a href="/caja" className="px-4 py-2 rounded border">Cancelar</a>
        </div>

        {error && <div className="col-span-2 text-red-600">{error}</div>}
      </form>
    </div>
  )
}
