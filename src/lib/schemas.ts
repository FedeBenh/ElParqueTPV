import { z } from 'zod'

export const articuloSchema = z.object({
  codigo: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
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
