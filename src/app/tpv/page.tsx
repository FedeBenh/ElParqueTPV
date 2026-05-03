'use client'
import React, { useEffect, useState } from 'react'

type Art = { id: number; codigo: string; nombre: string; precioVenta: number; stockActual: number; imagenUrl?: string }

export default function Page() {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<Art[]>([])
  const [ticket, setTicket] = useState<Array<{ articuloId: number; nombre: string; precioVenta: number; cantidad: number; stockActual: number }>>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ id: number; nombre: string }>>([])
  const [selectedCat, setSelectedCat] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/categorias').then((r) => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => {
      buscar()
    }, 250)
    return () => clearTimeout(id)
  }, [term, selectedCat])

  async function buscar() {
    const params = new URLSearchParams()
    if (term.trim()) params.set('q', term.trim())
    if (selectedCat) params.set('categoriaId', String(selectedCat))
    const res = await fetch('/api/tpv?' + params.toString())
    const data = await res.json()
    setResults(data)
  }

  function add(art: Art) {
    setTicket((t) => {
      const found = t.find((x) => x.articuloId === art.id)
      if (found) return t.map((x) => x.articuloId === art.id ? { ...x, cantidad: Math.min(x.cantidad + 1, art.stockActual) } : x)
      return [...t, { articuloId: art.id, nombre: art.nombre, precioVenta: Number(art.precioVenta), cantidad: 1, stockActual: art.stockActual }]
    })
  }

  function changeQty(id: number, delta: number) {
    setTicket((t) => t.map((x) => x.articuloId === id ? { ...x, cantidad: Math.max(1, Math.min(x.stockActual, x.cantidad + delta)) } : x))
  }

  function removeLine(id: number) {
    setTicket((t) => t.filter((x) => x.articuloId !== id))
  }

  function total() {
    return ticket.reduce((s, l) => s + l.precioVenta * l.cantidad, 0)
  }

  async function finalizar() {
    setError(null)
    setNotice(null)
    if (ticket.length === 0) { setError('El ticket está vacío'); return }
    for (const l of ticket) {
      if (l.cantidad > l.stockActual) { setError(`Stock insuficiente: ${l.nombre}`); return }
    }
    const payload = { metodoPago: 'EFECTIVO', lineas: ticket.map((l) => ({ articuloId: l.articuloId, cantidad: l.cantidad, precioVenta: l.precioVenta })) }
    const res = await fetch('/api/ventas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const j = await res.json()
    if (!res.ok) { setError(j?.error || 'Error'); return }
    if (!j.cajaSesionId) setNotice('Venta realizada pero no había caja abierta; no está asociada a una sesión de caja.')
    setTicket([])
    setResults([])
    setTerm('')
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <aside className="col-span-1">
        <h3 className="font-semibold mb-2">Categorías</h3>
        <div className="space-y-2">
          <button onClick={() => setSelectedCat(null)} className={`block w-full text-left p-2 rounded ${selectedCat === null ? 'bg-gray-200' : ''}`}>Todos</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setSelectedCat(c.id)} className={`block w-full text-left p-2 rounded ${selectedCat === c.id ? 'bg-gray-200' : ''}`}>{c.nombre}</button>
          ))}
        </div>
      </aside>

      <section className="col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <input value={term} onChange={(e) => setTerm(e.target.value)} className="border p-2 rounded w-full" placeholder="Buscar por código, nombre, descripción o categoría" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {results.map((r) => (
            <div key={r.id} className={`p-2 bg-white rounded shadow ${r.stockActual === 0 ? 'opacity-60' : ''}`}>
              <img src={r.imagenUrl || '/placeholder.png'} alt={r.nombre} className="w-full h-28 object-cover mb-2 rounded" />
              <div className="font-medium">{r.nombre}</div>
              <div className="text-sm text-gray-600">{r.codigo} • {r.stockActual} u</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-lg font-bold">{Number(r.precioVenta).toFixed(2)} €</div>
                <button disabled={r.stockActual === 0} onClick={() => add(r)} className="bg-blue-600 text-white px-3 py-1 rounded">Añadir</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="col-span-1">
        <h3 className="font-semibold mb-2">Ticket</h3>
        <div className="bg-white p-4 rounded shadow">
          {ticket.map((l) => (
            <div key={l.articuloId} className="flex items-center justify-between border-b py-2">
              <div>
                <div className="font-medium">{l.nombre}</div>
                <div className="text-sm text-gray-600">{l.precioVenta.toFixed(2)} €</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => changeQty(l.articuloId, -1)} className="px-2 py-1 border rounded">-</button>
                <div>{l.cantidad}</div>
                <button onClick={() => changeQty(l.articuloId, +1)} className="px-2 py-1 border rounded">+</button>
                <div className="w-24 text-right">{(l.precioVenta * l.cantidad).toFixed(2)} €</div>
                <button onClick={() => removeLine(l.articuloId)} className="text-red-600">Eliminar</button>
              </div>
            </div>
          ))}

          <div className="mt-4 text-right text-3xl font-bold">Total: {total().toFixed(2)} €</div>

          {error && <div className="text-red-600 mt-2">{error}</div>}
          {notice && <div className="text-green-600 mt-2">{notice}</div>}

          <div className="mt-4 flex gap-2">
            <button onClick={finalizar} className="bg-green-600 text-white px-4 py-2 rounded">Cobrar</button>
            <button onClick={() => setTicket([])} className="px-4 py-2 rounded border">Cancelar ticket</button>
          </div>
        </div>
      </aside>
    </div>
  )
}
