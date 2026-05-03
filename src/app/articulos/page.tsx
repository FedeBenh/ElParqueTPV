'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Page() {
  const [articulos, setArticulos] = useState<any[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    const res = await fetch('/api/articulos')
    const data = await res.json()
    setArticulos(data)
  }

  async function buscar(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const res = await fetch('/api/articulos?q=' + encodeURIComponent(q))
    const data = await res.json()
    setArticulos(data)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Artículos</h2>
        <Link href="/articulos/nuevo" className="bg-blue-600 text-white px-4 py-2 rounded">Nuevo artículo</Link>
      </div>

      <form onSubmit={buscar} className="mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por código o nombre" className="border p-2 rounded w-80 mr-2" />
        <button className="bg-gray-200 px-3 py-2 rounded">Buscar</button>
      </form>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Código</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Precio venta</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.codigo}</td>
                <td className="p-2">{a.nombre}</td>
                <td className="p-2">{Number(a.precioVenta).toFixed(2)} €</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded ${a.stockActual <= a.stockMinimo ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {a.stockActual}
                  </span>
                </td>
                <td className="p-2">
                  <Link href={`/articulos/${a.id}`} className="text-blue-600">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
