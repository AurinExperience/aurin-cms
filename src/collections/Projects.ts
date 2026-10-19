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
import { TextStylesFeature } from '../components/admin/textStyles'
import {
  AlignFeature,
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UploadFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/** "#D0DF00": la web lo pone tal cual en el CSS, así que solo hex de 6 dígitos */
const hexColor: Validate = (value) =>
  !value || /^#[0-9a-f]{6}$/i.test(String(value)) || 'Usa un color en formato #RRGGBB, por ejemplo #D0DF00.'

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
    defaultColumns: ['title', 'categories', 'status', 'featured', 'updatedAt'],
    group: 'Contenido',
    // Página de preview del sitio Astro: se redibuja mientras se escribe, sin guardar, y también muestra borradores
    livePreview: {
      url: ({ data, locale }) =>
        `${websiteURL}${locale?.code === 'en' ? '/en' : ''}/preview/project/${encodeURIComponent(data?.id || 'nuevo')}`,
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
      // Antes era un select con opciones fijas en el código y no veía las Categorías del CMS
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Categorías (filtros)',
      admin: {
        position: 'sidebar',
        description: 'Para los filtros del listado de proyectos. Se agregan o editan en Taxonomía → Categorías. No confundir con los Servicios de la portada.',
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
                      admin: {
                        description: 'Chips verdes bajo el título. Lo que hicimos en este proyecto.',
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
                          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                          BoldFeature(),
                          ItalicFeature(),
                          UnderlineFeature(),
                          StrikethroughFeature(),
                          TextStylesFeature(),
                          AlignFeature(),
                          IndentFeature(),
                          UnorderedListFeature(),
                          OrderedListFeature(),
                          BlockquoteFeature(),
                          HorizontalRuleFeature(),
                          // Imagen dentro del texto: el lápiz sobre la imagen abre "Ancho"; la
                          // alineación es la de la barra (izquierda/centro/derecha), como en Docs
                          UploadFeature({
                            collections: {
                              media: {
                                fields: [
                                  {
                                    name: 'width',
                                    type: 'select',
                                    label: 'Ancho',
                                    defaultValue: 'md',
                                    options: [
                                      { label: 'Pequeña (1/3 del texto)', value: 'sm' },
                                      { label: 'Mediana (1/2)', value: 'md' },
                                      { label: 'Grande (3/4)', value: 'lg' },
                                      { label: 'Completa', value: 'full' },
                                    ],
                                  },
                                ],
                              },
                            },
                          }),
                          LinkFeature(),
                          // Orden como en Google Docs: estilo, letra, B I U, color | alineación
                          FixedToolbarFeature({ customGroups: { align: { order: 45 }, indent: { order: 46 } } }),
                          InlineToolbarFeature(),
                        ],
                      }),
                      admin: {
                        className: 'aurin-texto',
                        description:
                          'Selecciona cualquier palabra y cámbiale Tipografía, Tamaño, Grosor, Color o Resaltado con los menús de la barra (también salen en la barrita que aparece al seleccionar). Estilos de bloque: si empieza con "Encabezado 2" es el título grande en dos tonos; más abajo, Encabezado 1 = título gigante blanco, 2 = subtítulo amarillo, 3 = etiqueta amarilla en negritas, 4 = subtítulo chico. Imagen: escribe "/subir" o usa el "+"; selecciónala y alinéala con el botón de alineación; el lápiz sobre ella cambia el ancho.',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: '3 · Dispositivo (antes de la galería)',
              fields: [
                {
                  name: 'device',
                  type: 'radio',
                  label: 'Dispositivo',
                  defaultValue: 'laptop',
                  options: [
                    { label: 'Laptop', value: 'laptop' },
                    { label: 'Tablet', value: 'tablet' },
                    { label: 'Celular', value: 'phone' },
                  ],
                  admin: { layout: 'horizontal' },
                },
                {
                  name: 'deviceImages',
                  type: 'array',
                  label: 'Imágenes en la pantalla',
                  labels: { singular: 'Imagen', plural: 'Imágenes' },
                  // Vacía, la página no muestra el dispositivo
                  admin: {
                    description:
                      'Pasan por la pantalla al hacer scroll, una debajo de otra en este orden. Sirve una captura de página completa o varias (para celular, capturas de celular). Vacío = no se muestra.',
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
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: '4 · Galería de imágenes (al final)',
              fields: [
                {
                  name: 'galleryLayout',
                  type: 'radio',
                  label: 'Cómo se muestran',
                  defaultValue: 'slider',
                  options: [
                    { label: 'Slider', value: 'slider' },
                    { label: 'Mosaico', value: 'masonry' },
                  ],
                  admin: {
                    components: { Field: '/components/admin/GalleryLayoutField#GalleryLayoutField' },
                  },
                },
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
                  admin: {
                    description: 'En celular se ajusta para no salirse de la pantalla.',
                    // Solo el slider tiene alto fijo; en mosaico cada foto va en su proporción
                    condition: (_, siblingData) => siblingData?.galleryLayout !== 'masonry',
                  },
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
                      label: 'Texto sobre la imagen (opcional)',
                      localized: true,
                      admin: {
                        description: 'Describe el proyecto en esta foto. En mosaico aparece debajo de la imagen al ampliarla.',
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: '5 · Tarjeta (en "Historias que hablan por sí solas" y el portafolio)',
              fields: [
                {
                  name: 'cardText',
                  type: 'group',
                  label: 'Texto de la tarjeta',
                  admin: {
                    description:
                      'Si escribes un texto, la tarjeta lo muestra sobre el color de fondo en lugar de la miniatura. Frases cortas (unas 8 palabras) se leen mejor. Enter = nueva línea.',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'richText',
                      label: 'Texto',
                      localized: true,
                      editor: lexicalEditor({
                        features: [
                          ParagraphFeature(),
                          BoldFeature(),
                          ItalicFeature(),
                          UnderlineFeature(),
                          AlignFeature(),
                          FixedToolbarFeature(),
                          InlineToolbarFeature(),
                        ],
                      }),
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'font',
                          type: 'select',
                          label: 'Tipografía',
                          defaultValue: 'display',
                          options: [
                            { label: 'Titillium Web (títulos)', value: 'display' },
                            { label: 'Clarity City (texto)', value: 'body' },
                          ],
                          admin: { width: '33%' },
                        },
                        {
                          name: 'weight',
                          type: 'select',
                          label: 'Grosor',
                          defaultValue: '600',
                          options: [
                            { label: 'Normal', value: '400' },
                            { label: 'Seminegrita', value: '600' },
                            { label: 'Negrita', value: '700' },
                          ],
                          admin: { width: '33%' },
                        },
                        {
                          name: 'size',
                          type: 'select',
                          label: 'Tamaño',
                          defaultValue: 'md',
                          options: [
                            { label: 'Chico', value: 'sm' },
                            { label: 'Mediano', value: 'md' },
                            { label: 'Grande', value: 'lg' },
                            { label: 'Extra grande', value: 'xl' },
                          ],
                          admin: {
                            width: '33%',
                            description: 'Crece y se encoge con la tarjeta: se ve igual en celular y en computadora.',
                          },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'background',
                          type: 'text',
                          label: 'Color de fondo',
                          defaultValue: '#D0DF00',
                          validate: hexColor,
                          admin: {
                            width: '50%',
                            placeholder: '#D0DF00',
                            components: { Field: '/components/admin/ColorField#ColorField' },
                          },
                        },
                        {
                          name: 'color',
                          type: 'text',
                          label: 'Color del texto',
                          defaultValue: '#0A0A0A',
                          validate: hexColor,
                          admin: {
                            width: '50%',
                            placeholder: '#0A0A0A',
                            components: { Field: '/components/admin/ColorField#ColorField' },
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'thumbnail',
                  type: 'upload',
                  label: 'Miniatura',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Imagen cuadrada (1:1), mínimo 800 × 800 px. Vacía = se recorta la imagen principal. Si hay texto de la tarjeta, se muestra el texto.',
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
