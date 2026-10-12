// Autogenerado de SEO para Projects (botones de @payloadcms/plugin-seo).
// Respeta los rangos que el plugin marca en verde: título 50–60, descripción 100–150.

export const TITLE = { min: 50, max: 60 }
export const DESCRIPTION = { min: 100, max: 150 }

type Locale = 'es' | 'en'

const clean = (text: string) => text.replace(/\s+/g, ' ').trim()

/** Corta en la última palabra completa que quepa (con "…" dentro del límite). */
const cutAtWord = (text: string, max: number) => {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.–-]+$/, '')}…`
}

/** Texto plano del richText (Lexical): cada bloque (encabezado, párrafo, lista) cierra frase. */
export const richTextToSentences = (value: any): string => {
  const inline = (node: any): string => node?.text ?? (node?.children ?? []).map(inline).join('')
  const blocks: string[] = (value?.root?.children ?? []).map((node: any) =>
    node?.type === 'list' ? (node.children ?? []).map(inline).map(clean).join(', ') : clean(inline(node)),
  )
  return blocks
    .filter(Boolean)
    .map((block) => (/[.!?…:]$/.test(block) ? block : `${block}.`))
    .join(' ')
}

export const generateProjectTitle = ({
  title,
  services = [],
  locale,
}: {
  title?: string
  services?: string[]
  locale: Locale
}) => {
  const name = clean(title ?? '')
  if (!name) return ''
  const service = services.map(clean).find(Boolean)
  const candidates = (
    locale === 'en'
      ? [
          service && `${name} – ${service} | Aurin`,
          `${name} | Aurin Design Portfolio`,
          `${name}: Case Study | Aurin`,
          `${name} | Aurin`,
        ]
      : [
          service && `${name} – ${service} | Aurin`,
          `${name} | Portafolio Aurin`,
          `${name}: caso de estudio | Aurin`,
          `${name} | Aurin`,
        ]
  ).filter((c): c is string => Boolean(c))

  const fits = candidates.filter((c) => c.length <= TITLE.max)
  // 1º: el primero en el rango ideal; 2º: el más largo que no se pase
  const best =
    fits.find((c) => c.length >= TITLE.min) ?? fits.sort((a, b) => b.length - a.length)[0]
  // Título del proyecto demasiado largo: se recorta para que siempre lleve la marca
  return best ?? `${cutAtWord(name, TITLE.max - ' | Aurin'.length)} | Aurin`
}

export const generateProjectDescription = ({
  description,
  services = [],
  client,
  locale,
}: {
  description?: unknown
  services?: string[]
  client?: string
  locale: Locale
}) => {
  const list = services.map(clean).filter(Boolean).slice(0, 3)
  const who = clean(client ?? '')
  // Arranca con qué se hizo y para quién: es lo que buscan Google y las IA ("quién hizo X")
  const lead = list.length
    ? `${list.join(', ')} ${locale === 'en' ? 'for' : 'para'} ${who || (locale === 'en' ? 'our client' : 'nuestro cliente')}.`
    : ''
  // Relleno solo si falta texto para llegar al mínimo, en este orden
  const closings =
    locale === 'en'
      ? ['A case study by Aurin, a design and development agency in Mexico.', 'See the process, design and results.']
      : ['Caso de estudio de Aurin, agencia de diseño y desarrollo en México.', 'Conoce el proceso, el diseño y los resultados.']

  const body = richTextToSentences(description)
  let text = clean(`${lead} ${body}`)
  for (const closing of closings) {
    // Sin texto del proyecto, el cierre entra si cabe completo; con texto, solo si falta para el mínimo
    const fitsWhole = text.length + 1 + closing.length <= DESCRIPTION.max
    if (text.length < DESCRIPTION.min || (!body && fitsWhole)) text = clean(`${text} ${closing}`)
  }
  if (text.length <= DESCRIPTION.max) return text

  // Mejor terminar en una frase completa si queda dentro del rango
  const window = text.slice(0, DESCRIPTION.max)
  const end = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '))
  if (end + 1 >= DESCRIPTION.min) return window.slice(0, end + 1)
  return cutAtWord(text, DESCRIPTION.max)
}

/** Nombres de archivo de placeholder ("800x600-…", "placeholder…"): no sirven para compartir. */
export const isUsableShareImage = (media: { width?: number | null; filename?: string | null } | null) =>
  Boolean(media && (media.width ?? 0) >= 600 && !/placeholder|\d{3,4}x\d{3,4}/i.test(media.filename ?? ''))

// Autoverificación: `node src/seo/projectSeo.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  const assert: typeof import('node:assert').strict = (await import('node:assert')).strict
  const inRange = (s: string, r: { min: number; max: number }) => s.length >= r.min && s.length <= r.max

  const t1 = generateProjectTitle({ title: 'Orquesta Sinfónica de Minería', services: ['Diseño web'], locale: 'es' })
  assert.ok(inRange(t1, TITLE), `${t1} (${t1.length})`)
  assert.ok(t1.includes('Diseño web'))

  const tLong = generateProjectTitle({ title: 'Una plataforma educativa muy larga para escuelas públicas del norte', locale: 'es' })
  assert.ok(tLong.length <= TITLE.max && tLong.endsWith('| Aurin'), tLong)

  const tShort = generateProjectTitle({ title: 'OSM', locale: 'en' })
  assert.ok(tShort.length <= TITLE.max && tShort.startsWith('OSM'), tShort)

  const para = (text: string) => ({ type: 'paragraph', children: [{ text }] })
  const rich = (...texts: string[]) => ({ root: { children: texts.map(para) } })

  const dShort = generateProjectDescription({ description: rich('Hola'), services: ['Branding'], client: 'ACME', locale: 'es' })
  assert.ok(inRange(dShort, DESCRIPTION), `${dShort} (${dShort.length})`)

  const long = 'Rediseñamos el sitio de la orquesta con un sistema de diseño propio. '.repeat(5)
  const dLong = generateProjectDescription({ description: rich(long), services: ['Diseño web', 'Desarrollo'], client: 'OSM', locale: 'es' })
  assert.ok(inRange(dLong, DESCRIPTION) && dLong.endsWith('.'), `${dLong} (${dLong.length})`)

  const dNoStop = generateProjectDescription({ description: rich('palabra '.repeat(40)), locale: 'en' })
  assert.ok(dNoStop.length <= DESCRIPTION.max && dNoStop.endsWith('…'), dNoStop)

  const dNoBody = generateProjectDescription({ services: ['UX/UI Design', 'Web development'], client: 'OSM', locale: 'en' })
  assert.ok(inRange(dNoBody, DESCRIPTION) && dNoBody.includes('Aurin'), `${dNoBody} (${dNoBody.length})`)

  assert.equal(
    richTextToSentences({ root: { children: [{ type: 'heading', children: [{ text: 'Música y tecnología' }] }, para('Un sitio nuevo')] } }),
    'Música y tecnología. Un sitio nuevo.',
  )

  assert.ok(!isUsableShareImage({ width: 400, filename: 'Image-400x300-abc.png' }))
  assert.ok(isUsableShareImage({ width: 1600, filename: 'osm-portada.jpg' }))
  console.log('projectSeo OK')
}
