'use client'
import { useRowLabel } from '@payloadcms/ui'

// Título de cada sección de "2 · Secciones": un resumen de lo que tiene, para ubicarla con todo
// contraído ("Mosaico · 4 imágenes", "Celular · 2 capturas", las primeras palabras del texto…)

const SIZE: Record<string, string> = { sm: 'bajo', md: 'normal', lg: 'alto', xl: 'extra alto' }
const DEVICE: Record<string, string> = { laptop: 'Laptop', tablet: 'Tablet', phone: 'Celular' }
const TYPE: Record<string, string> = { image: 'Imagen', text: 'Texto', device: 'Dispositivo', gallery: 'Galería' }

// En el formulario un array llega como su número de filas, no como la lista
const count = (rows: unknown) => (Array.isArray(rows) ? rows.length : typeof rows === 'number' ? rows : 0)
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const firstWords = (content: any): string => {
  const text = (node: any): string => node?.text ?? (node?.children ?? []).map(text).join('')
  const first = (content?.root?.children ?? []).map(text).find((line: string) => line.trim())
  return first ? (first.length > 60 ? `${first.slice(0, 60).trim()}…` : first) : ''
}

export const SectionRowLabel = () => {
  const { data, rowNumber } = useRowLabel<any>()
  const empty = ' — vacía, no se muestra'
  let label = ''
  switch (data?.blockType) {
    case 'image':
      label = `${data.image ? 'Imagen propia' : 'La portada'} · alto ${SIZE[data.height] ?? 'normal'}`
      break
    case 'text':
      label = firstWords(data.content) || `Sin texto${empty}`
      break
    case 'device': {
      const n = count(data.images)
      label = `${DEVICE[data.device] ?? 'Laptop'} · ${n ? plural(n, 'captura', 'capturas') : `sin capturas${empty}`}`
      break
    }
    case 'gallery': {
      const n = count(data.images)
      label = `${data.layout === 'masonry' ? 'Mosaico' : 'Slider'} · ${n ? plural(n, 'imagen', 'imágenes') : `sin imágenes${empty}`}`
      break
    }
  }
  return (
    <span className="aurin-section-label">
      {String((rowNumber ?? 0) + 1).padStart(2, '0')} · <strong>{TYPE[data?.blockType] ?? 'Sección'}</strong> · {label}
    </span>
  )
}
