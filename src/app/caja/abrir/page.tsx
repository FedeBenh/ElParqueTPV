'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [efectivoInicial, setEfectivoInicial] = useState<number>(0)
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function abrir(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/caja/abrir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ efectivoInicial, observacionesApertura: observaciones }) })
      if (!res.ok) { const j = await res.json(); throw new Error(j?.error || 'Error') }
      router.push('/caja')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Abrir caja</h2>
      <form onSubmit={abrir} className="max-w-md">
        <div>
          <label className="block text-sm mb-1">Efectivo inicial</label>
          <input type="number" step="0.01" min="0" value={efectivoInicial} onChange={(e) => setEfectivoInicial(Number(e.target.value))} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Observaciones</label>
          <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div className="mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Abrir caja</button>
          <a href="/caja" className="ml-2 px-4 py-2 rounded border">Cancelar</a>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  )
}
