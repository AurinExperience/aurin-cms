import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

// El slug de Projects pasó a ser por idioma: "x" → { es: "x", en: "x" }.
// Después cada proyecto puede tener su slug en inglés; la web redirige las URLs viejas.
export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  const { modifiedCount } = await payload.db.collections.projects.collection.updateMany(
    { slug: { $type: 'string' } },
    [{ $set: { slug: { es: '$slug', en: '$slug' } } }],
    // `as never`: payload trae mongodb 7 y la colección tipa con mongodb 6; en runtime es la misma sesión
    { session: session as never },
  )
  payload.logger.info(`Slugs localizados: ${modifiedCount}`)
}

export async function down({ payload, session }: MigrateDownArgs): Promise<void> {
  await payload.db.collections.projects.collection.updateMany(
    { 'slug.es': { $exists: true } },
    [{ $set: { slug: '$slug.es' } }],
    // `as never`: payload trae mongodb 7 y la colección tipa con mongodb 6; en runtime es la misma sesión
    { session: session as never },
  )
}
