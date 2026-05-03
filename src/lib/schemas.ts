import { z } from 'zod'

export const articuloSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  imagenUrl: z.string().optional().refine((v) => {
    if (v === undefined) return true
    if (v === '') return true
    try {
      const dataUrlRegex = /^data:image\/(png|jpeg|jpg);base64,[A-Za-z0-9+/=]+$/
      if (dataUrlRegex.test(v)) return true
      // allow normal urls
      // URL constructor will throw for invalid urls
      // eslint-disable-next-line no-unused-vars
      const u = new URL(v)
      return true
    } catch (e) {
      return false
    }
  }, { message: 'imagenUrl must be a valid URL or base64 data URL (data:image/...)' }),
  precioCompra: z.number().nonnegative(),
  precioVenta: z.number().nonnegative(),
  stockActual: z.number().int().nonnegative(),
  stockMinimo: z.number().int().nonnegative(),
  activo: z.boolean().optional()
})

export const articuloUpdateSchema = articuloSchema.partial()

export const compraLineaSchema = z.object({
  articuloId: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  precioCompra: z.number().nonnegative()
})

export const compraSchema = z.object({
  proveedor: z.string().optional(),
  observaciones: z.string().optional(),
  lineas: z.array(compraLineaSchema).min(1)
})

export const ventaLineaSchema = z.object({
  articuloId: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  precioVenta: z.number().nonnegative()
})

export const ventaSchema = z.object({
  metodoPago: z.enum(['EFECTIVO', 'TARJETA', 'BIZUM', 'OTRO']).optional(),
  observaciones: z.string().optional(),
  lineas: z.array(ventaLineaSchema).min(1)
})

export const categoriaSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  color: z.string().optional(),
  imagenUrl: z.string().url().optional(),
  activa: z.boolean().optional(),
  orden: z.number().int().optional()
})

export const cajaAperturaSchema = z.object({
  efectivoInicial: z.number().nonnegative(),
  observacionesApertura: z.string().optional()
})

export const cajaDenominacionSchema = z.object({
  tipo: z.enum(['MONEDA', 'BILLETE']),
  valor: z.number().positive(),
  cantidad: z.number().int().nonnegative()
})

export const cajaCierreSchema = z.object({
  cajaSesionId: z.number().int().positive(),
  denominaciones: z.array(cajaDenominacionSchema),
  observacionesCierre: z.string().optional()
})

export const cajaMovimientoSchema = z.object({
  cajaSesionId: z.number().int().positive(),
  tipo: z.enum(['ENTRADA', 'SALIDA', 'AJUSTE']),
  concepto: z.string().min(1),
  importe: z.number().nonnegative(),
  observaciones: z.string().optional()
})
