import type { CollectionConfig } from 'payload'
import { revalidateWebsiteAfterChange, revalidateWebsiteAfterDelete } from '../hooks/revalidateWebsite'

/** "foto-AbC…xyz.png": sufijo de 30 caracteres que agregaba Vercel Blob */
export const hasRandomSuffix = (filename: string) => /-[A-Za-z0-9]{30}\.[a-z0-9]+$/i.test(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Archivo',
    plural: 'Archivos',
  },
  admin: {
    group: 'Contenido',
  },
  access: {
    // Público solo para leer (la web muestra las imágenes). Subir, editar y borrar
    // usa el default de Payload: requiere sesión en el admin.
    read: () => true,
  },
  // Reemplazar o borrar una imagen también se refleja al instante en la web
  hooks: {
    afterChange: [revalidateWebsiteAfterChange],
    afterDelete: [revalidateWebsiteAfterDelete],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto Alternativo',
      required: true,
    },
  ],
  upload: {
    // No usar staticDir con Vercel Blob - el adapter lo maneja
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    // Límites de tamaño razonables
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
    ],
    // Las subidas viejas (con sufijo aleatorio de Vercel Blob, ver payload.config.ts) guardaron
    // tamaños con un nombre que no existe (404 = cuadro gris); para ellas se muestra el original.
    adminThumbnail: ({ doc }) => {
      const thumb = (doc.sizes as { thumbnail?: { url?: string } } | undefined)?.thumbnail?.url
      const filename = String(doc.filename ?? '')
      if (thumb && !hasRandomSuffix(filename)) return thumb
      // `doc` es el documento crudo de la base: `url` no siempre viene guardado
      return filename ? `/api/media/file/${encodeURIComponent(filename)}` : null
    },
  },
}
