import type { CollectionConfig } from 'payload'

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
    adminThumbnail: 'thumbnail',
  },
}
