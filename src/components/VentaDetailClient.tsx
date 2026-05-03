'use client'
import React, { useEffect, useState } from 'react'

export default function VentaDetailClient({ id }: { id: string }) {
  const [venta, setVenta] = useState<any | null>(null)

  useEffect(() => {
    fetch('/api/ventas/' + id).then((r) => r.json()).then(setVenta)
  }, [id])

  if (!venta) return <div>Cargando...</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Venta #{venta.id}</h2>
      <div className="mb-4">{new Date(venta.fecha).toLocaleString()}</div>
      <div className="bg-white rounded shadow p-4">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="p-2">Artículo</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.lineas.map((l: any) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{l.articulo?.nombre || 'Artículo'}</td>
                <td className="p-2">{l.cantidad}</td>
                <td className="p-2">{Number(l.precioVenta).toFixed(2)} €</td>
                <td className="p-2">{Number(l.subtotal).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-right text-xl font-bold">Total: {Number(venta.totalVenta).toFixed(2)} €</div>
      </div>
    </div>
  )
}
