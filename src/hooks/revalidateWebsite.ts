import { websiteURL } from '../websiteURL'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

// Avisa a la web (AurinWebsite /api/revalidate) que borre su caché del CDN, para que
// el cambio se vea al instante. Nunca bloquea el guardado: si falla, la web se
// actualiza sola en máximo 1 día (s-maxage=86400). Sin REVALIDATE_SECRET no hace nada.
// Va en toda colección que la web muestre (proyectos, media, categorías, etiquetas).
const purgeWebsiteCache = async (req: PayloadRequest) => {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return
  const url = `${websiteURL}/api/revalidate`
  try {
    const res = await fetch(url, {
      method: 'POST',
      // Content-Type obligatorio: en producción Astro (checkOrigin) responde 403 a un POST sin él
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) req.payload.logger.warn(`No se pudo refrescar la web (${url}): HTTP ${res.status}`)
  } catch (error) {
    req.payload.logger.warn(`No se pudo refrescar la web (${url}): ${String(error)}`)
  }
}

export const revalidateWebsiteAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await purgeWebsiteCache(req)
  return doc
}

export const revalidateWebsiteAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await purgeWebsiteCache(req)
  return doc
}
