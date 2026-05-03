'use client'
import React, { useEffect, useState } from 'react'

export default function Page() {
  const [compras, setCompras] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/compras').then((r) => r.json()).then(setCompras)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Compras</h2>
        <a href="/compras/nueva" className="bg-blue-600 text-white px-4 py-2 rounded">Nueva compra</a>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Fecha</th>
              <th className="p-2">Proveedor</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{new Date(c.fecha).toLocaleString()}</td>
                <td className="p-2">{c.proveedor || '-'}</td>
                <td className="p-2">{Number(c.totalCompra).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
