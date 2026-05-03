'use client'
import React, { useState } from 'react'

type Art = { id: number; codigo: string; nombre: string; precioVenta: number; stockActual: number }

export default function Page() {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<Art[]>([])
  const [ticket, setTicket] = useState<Array<{ articuloId: number; nombre: string; precioVenta: number; cantidad: number; stockActual: number }>>([])
  const [error, setError] = useState<string | null>(null)

  async function buscar() {
    const res = await fetch('/api/tpv?q=' + encodeURIComponent(term))
    const data = await res.json()
    setResults(data)
  }

  function add(art: Art) {
    setTicket((t) => {
      const found = t.find((x) => x.articuloId === art.id)
      if (found) return t.map((x) => x.articuloId === art.id ? { ...x, cantidad: x.cantidad + 1 } : x)
      return [...t, { articuloId: art.id, nombre: art.nombre, precioVenta: Number(art.precioVenta), cantidad: 1, stockActual: art.stockActual }]
    })
  }

  function changeQty(id: number, delta: number) {
    setTicket((t) => t.map((x) => x.articuloId === id ? { ...x, cantidad: Math.max(1, x.cantidad + delta) } : x))
  }

  function removeLine(id: number) {
    setTicket((t) => t.filter((x) => x.articuloId !== id))
  }

  function total() {
    return ticket.reduce((s, l) => s + l.precioVenta * l.cantidad, 0)
  }

  async function finalizar() {
    setError(null)
    if (ticket.length === 0) { setError('El ticket está vacío'); return }
    for (const l of ticket) {
      if (l.cantidad > l.stockActual) { setError(`Stock insuficiente: ${l.nombre}`); return }
    }
    const payload = { metodoPago: 'EFECTIVO', lineas: ticket.map((l) => ({ articuloId: l.articuloId, cantidad: l.cantidad, precioVenta: l.precioVenta })) }
    const res = await fetch('/api/ventas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { const j = await res.json(); setError(j?.error || 'Error'); return }
    setTicket([])
    setResults([])
    setTerm('')
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Buscar artículos</h2>
        <div className="flex gap-2 mb-4">
          <input value={term} onChange={(e) => setTerm(e.target.value)} className="border p-2 rounded w-full" placeholder="Código o nombre" />
          <button onClick={buscar} className="bg-gray-200 px-3 py-2 rounded">Buscar</button>
        </div>
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="p-2 bg-white rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{r.nombre}</div>
                <div className="text-sm text-gray-600">{r.codigo} — {r.stockActual} u</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold">{Number(r.precioVenta).toFixed(2)} €</div>
                <button onClick={() => add(r)} className="bg-blue-600 text-white px-3 py-1 rounded">Añadir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Ticket</h2>
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

          <div className="mt-4 text-right text-2xl font-bold">Total: {total().toFixed(2)} €</div>

          {error && <div className="text-red-600 mt-2">{error}</div>}

          <div className="mt-4 flex gap-2">
            <button onClick={finalizar} className="bg-green-600 text-white px-4 py-2 rounded">Finalizar venta</button>
            <button onClick={() => setTicket([])} className="px-4 py-2 rounded border">Cancelar ticket</button>
          </div>
        </div>
      </div>
    </div>
  )
}
