import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

// "Categorías (filtros)" pasó de un select fijo (`projectFilters`) a una relación con la
// colección Categorías (`categories`). Las opciones sin categoría equivalente se descartan.
const OLD_TO_SLUG: Record<string, string> = {
  'diseno-ux-ui': 'diseno-ux-ui',
  'desarrollo-web-movil': 'desarrollo-web',
  'desarrollo-branding': 'branding-y-comunicacion',
}

export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  // `as never`: payload trae mongodb 7 y la colección tipa con mongodb 6; en runtime es la misma sesión
  const opts = { session: session as never }
  const cats = await payload.db.collections.categories.collection
    .find({ slug: { $in: Object.values(OLD_TO_SLUG) } }, opts)
    .toArray()
  const idBySlug = new Map(cats.map((c) => [c.slug as string, c._id]))

  const projects = await payload.db.collections.projects.collection
    .find({ projectFilters: { $exists: true }, categories: { $exists: false } }, opts)
    .toArray()
  for (const p of projects) {
    const ids = (p.projectFilters as string[]).map((f) => idBySlug.get(OLD_TO_SLUG[f])).filter(Boolean)
    await payload.db.collections.projects.collection.updateOne({ _id: p._id }, { $set: { categories: ids } }, opts)
  }
  payload.logger.info(`Proyectos con categorías migradas: ${projects.length}`)
}

export async function down({ payload, session }: MigrateDownArgs): Promise<void> {
  // `projectFilters` nunca se borró, así que basta con quitar `categories`
  await payload.db.collections.projects.collection.updateMany(
    {},
    { $unset: { categories: '' } },
    { session: session as never },
  )
}
