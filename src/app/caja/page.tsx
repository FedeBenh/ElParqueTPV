'use client'
import React, { useEffect, useState } from 'react'

type Caja = any

export default function Page() {
  const [cajas, setCajas] = useState<Caja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/caja').then((r) => r.json()).then((d) => { setCajas(d || []); setLoading(false) }).catch((e) => { setError(String(e)); setLoading(false) })
  }, [])

  const abierta = cajas.find((c) => c.estado === 'ABIERTA')

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Caja</h2>

      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !abierta && (
        <div className="mb-4">
          <p>No hay caja abierta.</p>
          <a href="/caja/abrir" className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded">Abrir caja</a>
        </div>
      )}

      {!loading && abierta && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div><strong>Fecha apertura:</strong><div>{new Date(abierta.fechaApertura).toLocaleString()}</div></div>
            <div><strong>Efectivo inicial:</strong><div>{Number(abierta.efectivoInicial).toFixed(2)} €</div></div>
            <div><strong>Ventas en efectivo:</strong><div>{Number(abierta.ventas?.filter((v: any) => v.metodoPago === 'EFECTIVO').reduce((s: number, v: any) => s + Number(v.totalVenta || 0), 0)).toFixed(2)} €</div></div>
            <div><strong>Total vendido:</strong><div>{Number(abierta.ventas?.reduce((s: number, v: any) => s + Number(v.totalVenta || 0), 0)).toFixed(2)} €</div></div>
          </div>

          <div className="mt-4 flex gap-2">
            <a href="/caja/cerrar" className="bg-red-600 text-white px-4 py-2 rounded">Cerrar caja</a>
            <a href={`/caja/${abierta.id}`} className="px-4 py-2 rounded border">Ver detalles</a>
          </div>
        </div>
      )}

      <h3 className="text-lg font-medium mb-2">Histórico</h3>
      <div className="space-y-2">
        {cajas.filter((c) => c.estado === 'CERRADA').map((c) => (
          <div key={c.id} className="p-3 bg-white rounded shadow flex items-center justify-between">
            <div>
              <div className="font-medium">Cierre: {new Date(c.fechaCierre).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Diferencia: {Number(c.diferencia || 0).toFixed(2)} €</div>
            </div>
            <a href={`/caja/${c.id}`} className="px-3 py-1 rounded border">Ver</a>
          </div>
        ))}
      </div>
    </div>
  )
}
