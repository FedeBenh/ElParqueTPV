'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [articulos, setArticulos] = useState<any[]>([])
  const [form, setForm] = useState({ proveedor: '', observaciones: '' })
  const [lineas, setLineas] = useState<Array<{ articuloId: number; cantidad: number; precioCompra: number }>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/articulos').then((r) => r.json()).then(setArticulos)
  }, [])

  function addLinea() {
    setLineas((l) => [...l, { articuloId: articulos[0]?.id || 0, cantidad: 1, precioCompra: 0 }])
  }

  function updateLinea(i: number, data: any) {
    setLineas((l) => l.map((ln, idx) => (idx === i ? { ...ln, ...data } : ln)))
  }

  function removeLinea(i: number) {
    setLineas((l) => l.filter((_, idx) => idx !== i))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const payload = { proveedor: form.proveedor || undefined, observaciones: form.observaciones || undefined, lineas }
      const res = await fetch('/api/compras', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Error al guardar')
      router.push('/compras')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Nueva compra</h2>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Proveedor</label>
            <input placeholder="Proveedor" value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">Observaciones</label>
            <input placeholder="Observaciones" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} className="border p-2 rounded w-full" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Líneas</h3>
            <button type="button" onClick={addLinea} className="bg-gray-200 px-3 py-1 rounded">Añadir línea</button>
          </div>

          <div className="space-y-2">
            {lineas.map((ln, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Artículo</label>
                  <select value={ln.articuloId} onChange={(e) => updateLinea(i, { articuloId: Number(e.target.value) })} className="border p-2 rounded w-full">
                    {articulos.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Cantidad</label>
                  <input type="number" min={1} value={ln.cantidad} onChange={(e) => updateLinea(i, { cantidad: Number(e.target.value) })} className="border p-2 rounded w-24" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Precio</label>
                  <input type="number" step="0.01" value={ln.precioCompra} onChange={(e) => updateLinea(i, { precioCompra: Number(e.target.value) })} className="border p-2 rounded w-32" />
                </div>
                <div>
                  <button type="button" onClick={() => removeLinea(i)} className="text-red-600">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar compra</button>
          <a href="/compras" className="px-4 py-2 rounded border">Cancelar</a>
        </div>

        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  )
}
