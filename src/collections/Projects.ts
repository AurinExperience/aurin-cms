import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Proyecto',
    plural: 'Proyectos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'projectFilters', 'status', 'featured', 'updatedAt'],
    group: 'Contenido',
    // Muestra la página real del sitio Astro junto al formulario (refleja lo guardado, no lo que se está escribiendo)
    livePreview: {
      url: ({ data, locale }) =>
        `${process.env.WEBSITE_URL || 'http://localhost:4321'}${locale?.code === 'en' ? '/en' : ''}/project/${encodeURIComponent(data?.slug ?? '')}?v=${data?.updatedAt ?? ''}`,
      breakpoints: [
        { label: 'Móvil', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Escritorio', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  access: {
    read: () => true, // Público para el sitio web
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título del Proyecto',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL Slug',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Borrador',
          value: 'draft',
        },
        {
          label: 'Publicado',
          value: 'published',
        },
        {
          label: 'Archivado',
          value: 'archived',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: '¿Proyecto Destacado?',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      label: 'Fecha de Publicación',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'projectFilters',
      type: 'select',
      label: 'Categorías (filtros)',
      hasMany: true,
      options: [
        {
          label: 'Diseño UX/UI',
          value: 'diseno-ux-ui',
        },
        {
          label: 'Desarrollo web y de aplicaciones móviles',
          value: 'desarrollo-web-movil',
        },
        {
          label: 'Desarrollo de branding',
          value: 'desarrollo-branding',
        },
        {
          label: 'Marketing digital y redes sociales',
          value: 'marketing-digital',
        },
        {
          label: 'Pruebas de usabilidad',
          value: 'pruebas-usabilidad',
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'Para los filtros del listado de proyectos. No confundir con los Servicios de la portada.',
      },
    },
    // Solo cambian el layout del admin: las tabs sin `name` y los grupos sin label no alteran la forma de los datos
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Portada',
          description: 'Lo primero que se ve al abrir el proyecto, en este orden.',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              admin: { hideGutter: true },
              fields: [
                {
                  name: 'services',
                  type: 'array',
                  label: 'Servicios',
                  labels: { singular: 'Servicio', plural: 'Servicios' },
                  minRows: 1,
                  maxRows: 6,
                  admin: {
                    description: 'Chips verdes bajo el título. Lo que hicimos en este proyecto (máx. 6).',
                  },
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      label: 'Nombre del Servicio',
                      required: true,
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'description',
                  type: 'richText',
                  label: 'Descripción del Proyecto',
                  required: true,
                  localized: true,
                  admin: {
                    description: 'El primer párrafo en negrita se muestra como subtítulo.',
                  },
                },
                {
                  name: 'bannerImage',
                  type: 'upload',
                  label: 'Imagen Principal',
                  relationTo: 'media',
                  required: true,
                  admin: {
                    description: 'Imagen grande de portada. También se usa al compartir el enlace.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Cliente',
          fields: [
            {
              name: 'client',
              type: 'group',
              label: false,
              admin: { hideGutter: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      label: 'Nombre del Cliente',
                      required: true,
                    },
                    {
                      name: 'industry',
                      type: 'text',
                      label: 'Industria',
                    },
                  ],
                },
                {
                  name: 'logo',
                  type: 'upload',
                  label: 'Logo del Cliente',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Galería',
          fields: [
            {
              name: 'gallery',
              type: 'array',
              label: 'Imágenes',
              labels: { singular: 'Imagen', plural: 'Imágenes' },
              minRows: 1,
              admin: {
                description: 'Se muestran en este orden, debajo de la descripción. Arrastra para reordenar.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  label: 'Imagen',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'alt',
                  type: 'text',
                  label: 'Texto Alternativo',
                  required: true,
                  localized: true,
                  admin: {
                    description: 'Describe la imagen para accesibilidad y Google (no "Placeholder").',
                  },
                },
                {
                  name: 'caption',
                  type: 'text',
                  label: 'Descripción (opcional)',
                  localized: true,
                  admin: { description: 'Actualmente no se muestra en la web.' },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO y Extras',
          description: 'Estos campos actualmente no se muestran en la web.',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: 'SEO',
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                  label: 'Meta Título',
                  localized: true,
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  label: 'Meta Descripción',
                  localized: true,
                },
                {
                  name: 'ogImage',
                  type: 'upload',
                  label: 'Imagen Open Graph',
                  relationTo: 'media',
                },
              ],
            },
            {
              name: 'keywords',
              type: 'array',
              label: 'Palabras Clave',
              labels: { singular: 'Palabra Clave', plural: 'Palabras Clave' },
              fields: [
                {
                  name: 'keyword',
                  type: 'text',
                  label: 'Palabra Clave',
                  required: true,
                  localized: true,
                },
              ],
            },
            {
              name: 'website',
              type: 'text',
              label: 'Sitio Web del Proyecto',
              admin: {
                placeholder: 'https://ejemplo.com',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        // Convert plain text to Lexical format for hero.description
        if (data.hero?.description && typeof data.hero.description === 'string') {
          const paragraphs = data.hero.description.split('\n\n').filter((p: string) => p.trim())
          data.hero.description = {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              children: paragraphs.map((text: string) => ({
                type: 'paragraph',
                format: '',
                indent: 0,
                version: 1,
                children: [{
                  type: 'text',
                  format: 0,
                  text: text.replace(/\n/g, ' '),
                  version: 1,
                  mode: 'normal',
                  style: '',
                  detail: 0,
                }],
                direction: 'ltr',
              })),
              direction: 'ltr',
            },
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Trigger Astro site rebuild after project changes
        if (operation === 'update' || operation === 'create') {
          const deployHookUrl = process.env.ASTRO_DEPLOY_HOOK_URL;
          if (deployHookUrl) {
            try {
              await fetch(deployHookUrl, { method: 'POST' });
              console.log('Astro site rebuild triggered for project:', doc.title);
            } catch (error) {
              console.error('Failed to trigger Astro rebuild:', error);
            }
          }
        }
      },
    ],
  },
}
