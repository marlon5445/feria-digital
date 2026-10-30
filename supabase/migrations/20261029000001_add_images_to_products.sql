-- Migración: agregar columna images (arreglo de URLs) a la tabla products
-- Esta columna permite guardar múltiples fotos por producto (galería)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
