'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ArticuloEditClient({ id }: { id: string }) {
  const router = useRouter()
  const [form, setForm] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/articulos/' + id).then((r) => r.json()).then((d) => setForm(d)).catch(() => setForm(null))
  }, [id])

  if (!form) return <div>Cargando...</div>

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/articulos/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Error al guardar')
      router.push('/articulos')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function toggleActive() {
    await fetch('/api/articulos/' + id, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Editar artículo</h2>
      <form onSubmit={save} className="grid grid-cols-2 gap-4 max-w-2xl">
        <input value={form.codigo || ''} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="border p-2 rounded" />
        <input value={form.nombre || ''} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="border p-2 rounded" />
        <input value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="border p-2 rounded" />
        <input value={form.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="border p-2 rounded" />
        <input type="number" step="0.01" value={Number(form.precioCompra)} onChange={(e) => setForm({ ...form, precioCompra: Number(e.target.value) })} className="border p-2 rounded" />
        <input type="number" step="0.01" value={Number(form.precioVenta)} onChange={(e) => setForm({ ...form, precioVenta: Number(e.target.value) })} className="border p-2 rounded" />
        <input type="number" value={Number(form.stockActual)} onChange={(e) => setForm({ ...form, stockActual: Number(e.target.value) })} className="border p-2 rounded" />
        <input type="number" value={Number(form.stockMinimo)} onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })} className="border p-2 rounded" />

        <div className="col-span-2 flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
          <button type="button" onClick={toggleActive} className="px-4 py-2 rounded border">{form.activo ? 'Desactivar' : 'Activar'}</button>
          <a href="/articulos" className="px-4 py-2 rounded border">Cancelar</a>
        </div>

        {error && <div className="col-span-2 text-red-600">{error}</div>}
      </form>
    </div>
  )
}
