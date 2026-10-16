import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

// En "2 · Texto" la web tomaba como título un primer párrafo todo en negritas. Ahora el
// título es solo un Encabezado (y las negritas son solo negritas), así que esos párrafos
// pasan a Encabezado 2 sin negritas: en la web se ven igual que antes.
type Node = { type: string; format?: any; children?: Node[]; [k: string]: unknown }

const isBoldParagraph = (n?: Node) =>
  n?.type === 'paragraph' && !!n.children?.length && n.children.every((c) => c.type === 'text' && c.format & 1)

export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  // `as never`: payload trae mongodb 7 y la colección tipa con mongodb 6; en runtime es la misma sesión
  const opts = { session: session as never }
  const projects = payload.db.collections.projects.collection
  let count = 0
  for (const p of await projects.find({ 'hero.description': { $exists: true } }, opts).toArray()) {
    const desc = p.hero.description as Record<string, { root?: { children?: Node[] } } | null>
    let changed = false
    for (const locale of Object.keys(desc)) {
      const nodes = desc[locale]?.root?.children
      const first = nodes?.[0]
      if (!nodes || !isBoldParagraph(first)) continue
      const { textFormat, textStyle, ...rest } = first!
      nodes[0] = {
        ...rest,
        type: 'heading',
        tag: 'h2',
        children: first!.children!.map((c) => ({ ...c, format: c.format & ~1 })),
      }
      changed = true
    }
    if (changed) {
      await projects.updateOne({ _id: p._id }, { $set: { 'hero.description': desc } }, opts)
      count++
    }
  }
  payload.logger.info(`Títulos en negritas convertidos a Encabezado: ${count}`)
}

// Sin vuelta atrás automática: un Encabezado capturado a mano no se distingue de uno migrado
export async function down(_: MigrateDownArgs): Promise<void> {}
