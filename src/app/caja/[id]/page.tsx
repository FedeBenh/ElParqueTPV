'use client'
import React, { useEffect, useState } from 'react'

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id
  const [caja, setCaja] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [concepto, setConcepto] = useState('')
  const [importe, setImporte] = useState<number>(0)
  const [tipo, setTipo] = useState<'ENTRADA'|'SALIDA'|'AJUSTE'>('ENTRADA')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/caja/' + id).then((r) => r.json()).then((d) => { setCaja(d); setLoading(false) }).catch((e)=>{ setError(String(e)); setLoading(false) })
  }, [id])

  async function addMovimiento(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const payload = { tipo, concepto, importe, observaciones: '' }
      const res = await fetch('/api/caja/' + id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const j = await res.json(); throw new Error(j?.error || 'Error') }
      const updated = await res.json()
      setCaja((c: any) => ({ ...c, movimientos: [...(c.movimientos||[]), updated] }))
      setConcepto('')
      setImporte(0)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div>Cargando...</div>
  if (!caja) return <div>Caja no encontrada</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Caja {caja.id}</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded">
          <div><strong>Apertura:</strong> {new Date(caja.fechaApertura).toLocaleString()}</div>
          <div><strong>Cierre:</strong> {caja.fechaCierre ? new Date(caja.fechaCierre).toLocaleString() : '—'}</div>
          <div><strong>Efectivo inicial:</strong> {Number(caja.efectivoInicial).toFixed(2)} €</div>
          <div><strong>Diferencia:</strong> {Number(caja.diferencia || 0).toFixed(2)} €</div>
        </div>

        <div className="bg-white p-3 rounded">
          <div className="font-medium mb-2">Movimientos</div>
          <div className="space-y-2">
            {(caja.movimientos||[]).map((m: any) => (
              <div key={m.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{m.concepto}</div>
                  <div className="text-sm text-gray-600">{m.tipo} — {new Date(m.fecha).toLocaleString()}</div>
                </div>
                <div className="font-medium">{Number(m.importe).toFixed(2)} €</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded max-w-md">
        <h3 className="font-medium mb-2">Añadir movimiento</h3>
        <form onSubmit={addMovimiento} className="space-y-2">
          <div>
            <label className="block text-sm mb-1">Tipo</label>
            <select value={tipo} onChange={(e)=>setTipo(e.target.value as any)} className="border p-2 rounded w-full">
              <option value="ENTRADA">ENTRADA</option>
              <option value="SALIDA">SALIDA</option>
              <option value="AJUSTE">AJUSTE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Concepto</label>
            <input value={concepto} onChange={(e)=>setConcepto(e.target.value)} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">Importe</label>
            <input type="number" step="0.01" min="0" value={importe} onChange={(e)=>setImporte(Number(e.target.value))} className="border p-2 rounded w-full" />
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Añadir</button>
            <a href="/caja" className="px-4 py-2 rounded border">Volver</a>
          </div>
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  )
}
