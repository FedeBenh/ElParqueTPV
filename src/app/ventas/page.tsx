'use client'
import React, { useEffect, useState } from 'react'

export default function Page() {
  const [ventas, setVentas] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/ventas').then((r) => r.json()).then(setVentas)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Ventas</h2>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Fecha</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-2">{new Date(v.fecha).toLocaleString()}</td>
                <td className="p-2">{Number(v.totalVenta).toFixed(2)} €</td>
                <td className="p-2"><a href={`/ventas/${v.id}`} className="text-blue-600">Ver</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
