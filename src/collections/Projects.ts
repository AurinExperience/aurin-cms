import type { CollectionConfig, Validate } from 'payload'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { DESCRIPTION, TITLE } from '../seo/projectSeo'
import { revalidateWebsiteAfterChange, revalidateWebsiteAfterDelete } from '../hooks/revalidateWebsite'
import { websiteURL } from '../websiteURL'
import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/** El logo solo se repite entre proyectos del mismo cliente (Ancient y Ancient Wallets). */
const ownLogo: Validate = async (value, { req, id, event, siblingData }) => {
  const mediaID = value && typeof value === 'object' ? (value as { id?: string }).id : value
  if (!mediaID || event === 'onChange') return true
  const client = (siblingData as { name?: string } | undefined)?.name?.trim() ?? ''
  const { docs } = await req.payload.find({
    collection: 'projects',
    depth: 0,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        ...(id ? [{ id: { not_equals: id } }] : []),
        { 'client.logo': { equals: mediaID } },
        { 'client.name': { not_equals: client } },
      ],
    },
  })
  return docs.length
    ? `Este logo ya es de otro cliente (proyecto "${docs[0].title}"). Sube el logo de este cliente o deja el campo vacío.`
    : true
}

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
    // Página de preview del sitio Astro: se redibuja mientras se escribe, sin guardar, y también muestra borradores
    livePreview: {
      url: ({ data, locale }) =>
        `${websiteURL}${locale?.code === 'en' ? '/en' : ''}/preview/project/${encodeURIComponent(data?.id ?? '')}`,
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
  // Historial: cada guardado queda como versión y se puede comparar o restaurar (pestaña "Versiones").
  // Sin drafts a propósito: la visibilidad en la web la sigue controlando el campo "Estado".
  versions: {
    maxPerDoc: 50,
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
      // Uno por idioma: /project/orquesta-sinfonica y /en/project/symphony-orchestra
      localized: true,
      admin: {
        position: 'sidebar',
        description: 'La URL en el idioma que tienes elegido arriba a la derecha (Locale). Para la de inglés, cambia a English. Vacío = se genera del título.',
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
    // Tabs sin `name`, collapsibles y grupos sin label solo cambian el layout del admin, no la forma de los datos
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenido',
          description: 'En el mismo orden que la página, de arriba hacia abajo.',
          fields: [
            {
              type: 'collapsible',
              label: '1 · Arriba: logo, título, servicios e imagen',
              admin: { description: 'El título se edita en el campo de hasta arriba.' },
              fields: [
                {
                  name: 'client',
                  type: 'group',
                  label: 'Cliente',
                  admin: { description: 'En la web solo se muestra el logo, junto al título.' },
                  fields: [
                    {
                      name: 'logo',
                      type: 'upload',
                      label: 'Logo del Cliente',
                      relationTo: 'media',
                      validate: ownLogo,
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'logoSize',
                          type: 'select',
                          label: 'Tamaño del logo',
                          defaultValue: 'md',
                          options: [
                            { label: 'Pequeño', value: 'sm' },
                            { label: 'Normal', value: 'md' },
                            { label: 'Grande', value: 'lg' },
                            { label: 'Extra grande', value: 'xl' },
                          ],
                        },
                        {
                          name: 'logoColor',
                          type: 'select',
                          label: 'Color del logo',
                          defaultValue: 'white',
                          options: [
                            { label: 'Blanco (para fondo oscuro)', value: 'white' },
                            { label: 'Colores originales', value: 'original' },
                          ],
                          admin: {
                            description: 'Blanco convierte cualquier logo a blanco. Usa originales si el logo se ve bien sobre negro.',
                          },
                        },
                      ],
                    },
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
                  ],
                },
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
                        initCollapsed: true,
                        components: {
                          RowLabel: { path: '/components/ArrayRowLabel#ArrayRowLabel', clientProps: { fallback: 'Servicio' } },
                        },
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
                      name: 'bannerImage',
                      type: 'upload',
                      label: 'Imagen Principal',
                      relationTo: 'media',
                      // Opcional: al ser obligatoria, los proyectos sin fotos todavía
                      // reciclaban la de Elite y el portafolio la repetía en todas las
                      // tarjetas. Vacía, el sitio muestra el placeholder "Proyecto Aurin".
                      admin: {
                        description:
                          'Imagen grande de portada. También se usa al compartir el enlace. Si el proyecto aún no tiene fotos, déjala vacía: no reutilices la de otro proyecto.',
                      },
                    },
                    {
                      name: 'bannerHeight',
                      type: 'select',
                      label: 'Alto de la imagen principal',
                      defaultValue: 'md',
                      options: [
                        { label: 'Bajo', value: 'sm' },
                        { label: 'Normal', value: 'md' },
                        { label: 'Alto', value: 'lg' },
                        { label: 'Extra alto', value: 'xl' },
                      ],
                      admin: { description: 'La imagen se recorta para llenar el alto; en celular y tablet escala en proporción.' },
                    },
                    {
                      name: 'description',
                      type: 'richText',
                      label: '2 · Texto (debajo de la imagen principal)',
                      required: true,
                      localized: true,
                      // Solo los formatos que la web sabe dibujar (renderRichText* en AurinWebsite/src/lib/payload.ts)
                      editor: lexicalEditor({
                        features: [
                          ParagraphFeature(),
                          HeadingFeature({ enabledHeadingSizes: ['h2'] }),
                          BoldFeature(),
                          ItalicFeature(),
                          UnderlineFeature(),
                          UnorderedListFeature(),
                          OrderedListFeature(),
                          BlockquoteFeature(),
                          LinkFeature(),
                          FixedToolbarFeature(),
                          InlineToolbarFeature(),
                        ],
                      }),
                      admin: {
                        description: 'Usa "Encabezado 2" para el título grande (con dos encabezados seguidos, el primero sale resaltado). Todo lo demás va debajo, en párrafos, listas o citas.',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: '3 · Carrusel de imágenes (al final)',
              fields: [
                {
                  name: 'galleryHeight',
                  type: 'select',
                  label: 'Alto de las imágenes',
                  defaultValue: 'md',
                  options: [
                    { label: 'Bajo', value: 'sm' },
                    { label: 'Normal', value: 'md' },
                    { label: 'Alto', value: 'lg' },
                    { label: 'Extra alto', value: 'xl' },
                  ],
                  admin: { description: 'En celular se ajusta para no salirse de la pantalla.' },
                },
                {
                  name: 'gallery',
                  type: 'array',
                  label: 'Imágenes',
                  labels: { singular: 'Imagen', plural: 'Imágenes' },
                  // Sin mínimo: con `minRows: 1` un proyecto sin fotos tenía que tomar
                  // prestada la de otro. Vacía, la página no muestra galería.
                  admin: {
                    description: 'Se muestran en este orden. Arrastra para reordenar.',
                    initCollapsed: true,
                    components: {
                      RowLabel: { path: '/components/ArrayRowLabel#ArrayRowLabel', clientProps: { fallback: 'Imagen' } },
                    },
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
                      label: 'Texto Alternativo (opcional)',
                      localized: true,
                      admin: {
                        description: 'Vacío = se usa el de la imagen en Archivos. Llénalo para describirla en este proyecto o en otro idioma.',
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
              type: 'collapsible',
              label: '4 · Miniatura (tarjeta en "Historias que hablan por sí solas" y el portafolio)',
              fields: [
                {
                  name: 'thumbnail',
                  type: 'upload',
                  label: 'Miniatura',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Imagen cuadrada (1:1), mínimo 800 × 800 px. Vacía = se recorta la imagen principal.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          description: 'Cómo aparece el proyecto en Google y al compartir el enlace. Todo es opcional.',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
              admin: { hideGutter: true },
              // Campos de @payloadcms/plugin-seo con los nombres de siempre (sin migrar datos).
              // Si se dejan vacíos, la web usa el título, el texto y la imagen principal.
              fields: [
                OverviewField({
                  titlePath: 'seo.metaTitle',
                  descriptionPath: 'seo.metaDescription',
                  imagePath: 'seo.ogImage',
                }),
                // Sin maxLength ni minLength: bloquean guardar el proyecto entero. Con maxLength 150,
                // 13 proyectos con descripciones viejas más largas no se podían guardar ni para
                // cambiar una imagen. El indicador del plugin ya marca en verde el rango ideal.
                MetaTitleField({
                  hasGenerateFn: true,
                  overrides: {
                    name: 'metaTitle',
                    label: 'Título en Google',
                    admin: { description: `Ideal ${TITLE.min}–${TITLE.max} caracteres. "Auto-generar" lo arma con el nombre y el servicio principal.` },
                  },
                }),
                MetaDescriptionField({
                  hasGenerateFn: true,
                  overrides: {
                    name: 'metaDescription',
                    label: 'Descripción en Google',
                    admin: { description: `Ideal ${DESCRIPTION.min}–${DESCRIPTION.max} caracteres. Di qué se hizo, para quién y el resultado.` },
                  },
                }),
                MetaImageField({
                  hasGenerateFn: true,
                  relationTo: 'media',
                  overrides: {
                    name: 'ogImage',
                    label: 'Imagen al compartir',
                    localized: false,
                    admin: {
                      description: 'La que sale en WhatsApp, LinkedIn, etc. Ideal 1200×630. Si está vacía se usa la imagen principal.',
                    },
                  },
                }),
                PreviewField({
                  hasGenerateFn: true,
                  titlePath: 'seo.metaTitle',
                  descriptionPath: 'seo.metaDescription',
                }),
              ],
            },
            {
              name: 'website',
              type: 'text',
              label: 'Sitio Web del Proyecto',
              admin: {
                placeholder: 'https://ejemplo.com',
                description: 'El sitio real del cliente. Se le indica a Google como el trabajo publicado.',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    // La web borra su caché al instante cuando cambia un proyecto
    afterChange: [revalidateWebsiteAfterChange],
    afterDelete: [revalidateWebsiteAfterDelete],
    // beforeValidate (no beforeChange): el slug es obligatorio y la validación corre antes de beforeChange
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data?.title) return data
        if (!data.slug) {
          data.slug = slugify(data.title)
          return data
        }
        // En inglés, un slug que sigue siendo la copia del español se traduce desde el título en inglés.
        // La URL vieja (/en/project/{slug-es}) redirige 301 a la nueva desde la web.
        if (req.locale === 'en' && originalDoc?.id) {
          const es = await req.payload.findByID({
            collection: 'projects',
            id: originalDoc.id,
            locale: 'es',
            fallbackLocale: false,
            depth: 0,
            // Sin `req`: findByID le cambiaría req.locale a 'es' y el guardado en inglés escribiría en español
          })
          if (data.slug === es?.slug && slugify(data.title) !== es.slug) data.slug = slugify(data.title)
        }
        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
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
  },
}

/** "Orquesta Sinfónica de Minería" → "orquesta-sinfonica-de-mineria" */
export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
