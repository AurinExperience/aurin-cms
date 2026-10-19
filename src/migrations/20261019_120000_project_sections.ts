import { randomBytes } from 'crypto'
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

// Las secciones fijas del proyecto (imagen principal, "2 · Texto", dispositivo y galería) pasan a
// "2 · Secciones", bloques que se pueden mover, repetir o quitar. Cada proyecto queda con la base
// de siempre, en el mismo orden y con sus datos. Los campos viejos se quedan en la base sin tocar
// (el admin ya no los muestra), así `down` solo tiene que borrar las secciones.

// Igual que los IDs de filas que genera Payload: 24 caracteres hex
const rowID = () => randomBytes(12).toString('hex')

export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  // `as never`: payload trae mongodb 7 y la colección tipa con mongodb 6; en runtime es la misma sesión
  const opts = { session: session as never }
  const projects = payload.db.collections.projects.collection
  let count = 0
  for (const p of await projects.find({ sections: { $exists: false } }, opts).toArray()) {
    const sections = [
      // Sin imagen propia: la web usa la portada (hero.bannerImage), como hasta ahora
      { id: rowID(), blockType: 'image', height: p.hero?.bannerHeight ?? 'md' },
      { id: rowID(), blockType: 'text', content: p.hero?.description ?? null },
      { id: rowID(), blockType: 'device', device: p.device ?? 'laptop', images: p.deviceImages ?? [] },
      {
        id: rowID(),
        blockType: 'gallery',
        layout: p.galleryLayout ?? 'slider',
        height: p.galleryHeight ?? 'md',
        images: p.gallery ?? [],
      },
    ]
    await projects.updateOne({ _id: p._id }, { $set: { sections } }, opts)
    count++
  }
  payload.logger.info(`Proyectos pasados a secciones: ${count}`)
}

export async function down({ payload, session }: MigrateDownArgs): Promise<void> {
  const opts = { session: session as never }
  await payload.db.collections.projects.collection.updateMany({}, { $unset: { sections: '' } }, opts)
}
