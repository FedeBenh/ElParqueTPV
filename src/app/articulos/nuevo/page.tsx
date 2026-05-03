'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [form, setForm] = useState({ codigo: '', nombre: '', descripcion: '', categoria: '', imagenUrl: '', precioCompra: 0, precioVenta: 0, stockActual: 0, stockMinimo: 0, activo: true })
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/articulos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Error')
      router.push('/articulos')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Nuevo artículo</h2>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="block text-sm mb-1">Código</label>
          <input placeholder="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Categoría</label>
          <input placeholder="Categoría" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block text-sm mb-1">Descripción</label>
          <input placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block text-sm mb-1">Precio compra</label>
          <input type="number" step="0.01" placeholder="Precio compra" value={form.precioCompra} onChange={(e) => setForm({ ...form, precioCompra: Number(e.target.value) })} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block text-sm mb-1">Precio venta</label>
          <input type="number" step="0.01" placeholder="Precio venta" value={form.precioVenta} onChange={(e) => setForm({ ...form, precioVenta: Number(e.target.value) })} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block text-sm mb-1">Stock actual</label>
          <input type="number" placeholder="Stock actual" value={form.stockActual} onChange={(e) => setForm({ ...form, stockActual: Number(e.target.value) })} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block text-sm mb-1">Stock mínimo</label>
          <input type="number" placeholder="Stock mínimo" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })} className="border p-2 rounded w-full" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1">URL de la imagen (opcional)</label>
          <input placeholder="https://..." value={form.imagenUrl || ''} onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })} className="border p-2 rounded w-full mb-2" />
          <label className="block text-sm mb-1">O subir imagen</label>
          <input type="file" accept="image/*" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              const dataUrl = String(reader.result || '')
              setForm((f) => ({ ...f, imagenUrl: dataUrl }))
            }
            reader.readAsDataURL(file)
          }} className="w-full" />
        </div>
        <div className="col-span-2 flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
          <a href="/articulos" className="px-4 py-2 rounded border">Cancelar</a>
        </div>
        {error && <div className="col-span-2 text-red-600">{error}</div>}
      </form>
    </div>
  )
}
