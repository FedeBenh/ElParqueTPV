import '../styles/globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'TPV Tienda',
  description: 'Gestión tienda de alimentación'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex">
          <aside className="w-64 bg-white border-r p-4">
            <h1 className="text-xl font-bold mb-4">TPV Tienda</h1>
            <nav className="space-y-2">
              <Link href="/" className="block p-2 rounded hover:bg-gray-100">Inicio</Link>
              <Link href="/articulos" className="block p-2 rounded hover:bg-gray-100">Artículos</Link>
              <Link href="/compras" className="block p-2 rounded hover:bg-gray-100">Compras</Link>
              <Link href="/ventas" className="block p-2 rounded hover:bg-gray-100">Ventas</Link>
              <Link href="/tpv" className="block p-2 rounded hover:bg-gray-100">TPV</Link>
              <Link href="/resumen" className="block p-2 rounded hover:bg-gray-100">Resumen</Link>
            </nav>
          </aside>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
