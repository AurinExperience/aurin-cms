import type { Block, Field } from 'payload'
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

// "2 · Secciones" de Projects: bloques que se apilan debajo del título, en el orden que elija
// quien edita. La web dibuja cada uno en Template.astro (AurinWebsite) según su `blockType`.

const sizeOptions = [
  { label: 'Bajo', value: 'sm' },
  { label: 'Normal', value: 'md' },
  { label: 'Alto', value: 'lg' },
  { label: 'Extra alto', value: 'xl' },
]

/** Filas de imágenes: imagen + alt del proyecto (+ texto sobre la foto en la galería) */
const imageRows = (description: string, caption = false): Field => ({
  name: 'images',
  type: 'array',
  label: 'Imágenes',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  admin: {
    description,
    initCollapsed: true,
    components: {
      RowLabel: { path: '/components/ArrayRowLabel#ArrayRowLabel', clientProps: { fallback: 'Imagen' } },
    },
  },
  fields: [
    { name: 'image', type: 'upload', label: 'Imagen', relationTo: 'media', required: true },
    {
      name: 'alt',
      type: 'text',
      label: 'Texto Alternativo (opcional)',
      localized: true,
      admin: {
        description: 'Vacío = se usa el de la imagen en Archivos. Llénalo para describirla en este proyecto o en otro idioma.',
      },
    },
    ...(caption
      ? [
          {
            name: 'caption',
            type: 'text',
            label: 'Texto sobre la imagen (opcional)',
            localized: true,
            admin: { description: 'Describe el proyecto en esta foto. En mosaico aparece debajo de la imagen al ampliarla.' },
          } satisfies Field,
        ]
      : []),
  ],
})

export const imageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  imageURL: '/blocks/image.svg',
  imageAltText: 'Una imagen grande a todo lo ancho',
  admin: { disableBlockName: true, components: { Label: '/components/SectionRowLabel#SectionRowLabel' } },
  fields: [
    {
      name: 'image',
      type: 'upload',
      label: 'Imagen',
      relationTo: 'media',
      admin: { description: 'Vacía = la imagen de portada (sección 1).' },
    },
    {
      name: 'height',
      type: 'select',
      label: 'Alto',
      defaultValue: 'md',
      options: sizeOptions,
      admin: { description: 'La imagen se recorta para llenar el alto; en celular y tablet escala en proporción.' },
    },
  ],
}

export const textBlock: Block = {
  slug: 'text',
  labels: { singular: 'Texto', plural: 'Textos' },
  imageURL: '/blocks/text.svg',
  imageAltText: 'Título y párrafos',
  admin: { disableBlockName: true, components: { Label: '/components/SectionRowLabel#SectionRowLabel' } },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: 'Texto',
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
}

export const deviceBlock: Block = {
  slug: 'device',
  labels: { singular: 'Dispositivo', plural: 'Dispositivos' },
  imageURL: '/blocks/device.svg',
  imageAltText: 'Laptop, tablet o celular con capturas que pasan al hacer scroll',
  admin: { disableBlockName: true, components: { Label: '/components/SectionRowLabel#SectionRowLabel' } },
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
      name: 'direction',
      type: 'radio',
      label: 'Hacia dónde pasan las capturas',
      defaultValue: 'vertical',
      options: [
        { label: 'Hacia arriba (una página larga)', value: 'vertical' },
        { label: 'A los lados (una pantalla por captura)', value: 'horizontal' },
      ],
      admin: {
        layout: 'horizontal',
        description: 'A los lados, cada captura llena la pantalla y se detiene un momento antes de pasar a la siguiente.',
      },
    },
    imageRows(
      'Pasan por la pantalla al hacer scroll, en este orden. Hacia arriba sirve una captura de página completa o varias; a los lados, una por pantalla (para celular, capturas de celular).',
    ),
  ],
}

export const galleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Galería', plural: 'Galerías' },
  imageURL: '/blocks/gallery.svg',
  imageAltText: 'Varias imágenes en slider o mosaico',
  admin: { disableBlockName: true, components: { Label: '/components/SectionRowLabel#SectionRowLabel' } },
  fields: [
    {
      name: 'layout',
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
      name: 'height',
      type: 'select',
      label: 'Alto de las imágenes',
      defaultValue: 'md',
      options: sizeOptions,
      admin: {
        description: 'En celular se ajusta para no salirse de la pantalla.',
        // Solo el slider tiene alto fijo; en mosaico cada foto va en su proporción
        condition: (_, siblingData) => siblingData?.layout !== 'masonry',
      },
    },
    imageRows('Se muestran en este orden. Arrastra para reordenar.', true),
  ],
}

/** La base que trae un proyecto nuevo: imagen, texto, dispositivo y galería */
export const DEFAULT_SECTIONS = [
  { blockType: 'image', height: 'md' },
  { blockType: 'text' },
  { blockType: 'device', device: 'laptop', direction: 'vertical' },
  { blockType: 'gallery', layout: 'slider', height: 'md' },
]
