import type { CollectionConfig } from 'payload'

// "Diseño UX/UI" → "diseno-ux-ui"
const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// Son los filtros del listado de proyectos en la web: solo salen las que tienen al menos un proyecto
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Categoría',
    plural: 'Categorías',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    group: 'Taxonomía',
    description:
      'Los filtros del listado de proyectos. Se asignan en cada proyecto, en "Categorías (filtros)". En la web solo aparecen las que tienen al menos un proyecto.',
  },
  defaultSort: 'name',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre',
      required: true,
      localized: true,
      admin: { description: 'Captúralo en español y en inglés (selector de idioma arriba a la derecha).' },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Identificador',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Se llena solo con el nombre. Déjalo así.',
      },
    },
  ],
  hooks: {
    // beforeValidate y no beforeChange: así el slug ya existe cuando se revisa que sea único
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && typeof data.name === 'string') data.slug = slugify(data.name)
        return data
      },
    ],
  },
}
