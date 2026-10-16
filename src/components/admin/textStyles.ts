import { createServerFeature } from '@payloadcms/richtext-lexical'

// Menús de la barra de "2 · Texto" (como en Google Docs/Word): cada uno guarda su valor en el
// texto (`$: { font, size, … }`) y la web lo dibuja con los mismos valores en
// AurinWebsite/src/blocks/shared/Template/Template.module.css ([data-font] etc.).
// Si agregas una opción aquí, agrégala allá.
export type TextStyleOption = { value: string; label: string; css: Record<string, string> }
export type TextStyleGroup = { key: string; label: string; order: number; options: TextStyleOption[] }

const weight = (value: string, label: string, n: number) => ({ value, label, css: { 'font-weight': String(n) } })

export const textStyleGroups: TextStyleGroup[] = [
  {
    key: 'font',
    label: 'Tipografía',
    order: 26,
    options: [
      { value: 'display', label: 'Titillium Web', css: { 'font-family': "'Titillium Web', sans-serif" } },
      { value: 'body', label: 'Clarity City', css: { 'font-family': "'Clarity City', sans-serif" } },
    ],
  },
  {
    key: 'size',
    label: 'Tamaño',
    order: 27,
    options: [14, 16, 18, 20, 24, 32, 40, 48, 64, 80, 96].map((n) => ({
      value: String(n),
      label: `${n} px`,
      css: { 'font-size': `${n}px`, 'line-height': '1.15' },
    })),
  },
  {
    key: 'weight',
    label: 'Grosor',
    order: 28,
    options: [
      weight('thin', 'Delgada', 200),
      weight('light', 'Ligera', 300),
      weight('regular', 'Normal', 400),
      weight('semibold', 'Seminegrita', 600),
      weight('bold', 'Negrita', 700),
      weight('extrabold', 'Extra negrita', 800),
      weight('black', 'Negra', 900),
    ],
  },
  {
    key: 'color',
    label: 'Color',
    order: 41,
    options: [
      { value: 'amarillo', label: 'Amarillo Aurin', css: { color: '#D0DF00' } },
      { value: 'blanco', label: 'Blanco', css: { color: '#FFFFFF' } },
      { value: 'gris', label: 'Gris', css: { color: '#A0A0A0' } },
    ],
  },
  {
    key: 'mark',
    label: 'Resaltado',
    order: 42,
    options: [
      { value: 'amarillo', label: 'Amarillo', css: { 'background-color': '#D0DF00', color: '#0A0A0A' } },
      { value: 'gris', label: 'Gris', css: { 'background-color': '#282828', color: '#FFFFFF' } },
    ],
  },
]

export const TextStylesFeature = createServerFeature<undefined, undefined, { groups: TextStyleGroup[] }>({
  key: 'aurinTextStyles',
  feature: {
    ClientFeature: '/components/admin/TextStyles.client#TextStylesClient',
    clientFeatureProps: { groups: textStyleGroups },
  },
})
