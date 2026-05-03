'use client'
import React, { useEffect, useState } from 'react'

export default function Page() {
  const [resumen, setResumen] = useState<any>(null)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  async function fetchResumen(d?: string, h?: string) {
    const params = new URLSearchParams()
    if (d) params.set('desde', d)
    if (h) params.set('hasta', h)
    const res = await fetch('/api/resumen?' + params.toString())
    const data = await res.json()
    setResumen(data)
  }

  useEffect(() => {
    fetchResumen()
  }, [])

  if (!resumen) return <div>Cargando...</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Resumen</h2>

      <div className="flex gap-2 mb-4">
        <div>
          <label className="block text-sm">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="border p-2 rounded" />
        </div>
        <div className="flex items-end">
          <button onClick={() => fetchResumen(desde, hasta)} className="bg-gray-200 px-3 py-2 rounded">Aplicar</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total vendido</div>
          <div className="text-xl font-bold">{Number(resumen.totalVendido).toFixed(2)} €</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Número tickets</div>
          <div className="text-xl font-bold">{resumen.tickets}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total compras</div>
          <div className="text-xl font-bold">{Number(resumen.totalCompras || 0).toFixed(2)} €</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Beneficio estimado</div>
          <div className="text-xl font-bold">{Number(resumen.beneficioEstimado || 0).toFixed(2)} €</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">Artículos con stock bajo</h3>
      <div className="bg-white rounded shadow p-4 mb-6">
        <ul>
          {resumen.articulosBajo.map((a: any) => (
            <li key={a.id} className="py-1">{a.nombre} — {a.stockActual} (mín {a.stockMinimo})</li>
          ))}
        </ul>
      </div>

      <h3 className="text-lg font-semibold mb-2">Últimas ventas</h3>
      <div className="bg-white rounded shadow p-4">
        <ul>
          {resumen.ultimasVentas.map((v: any) => (
            <li key={v.id} className="py-1">{new Date(v.fecha).toLocaleString()} — {Number(v.totalVenta).toFixed(2)} €</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
