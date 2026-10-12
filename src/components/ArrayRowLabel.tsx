'use client'
import { useRowLabel } from '@payloadcms/ui'

// Título de cada fila colapsada: el texto de la fila en vez de "Fila 01"
export const ArrayRowLabel = ({ fallback = 'Fila' }: { fallback?: string }) => {
  const { data, rowNumber } = useRowLabel<{ name?: string; alt?: string }>()
  return <span>{data?.name || data?.alt || `${fallback} ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span>
}
