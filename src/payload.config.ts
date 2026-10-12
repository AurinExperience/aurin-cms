// storage-adapter-import-placeholder
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'

const allowedOrigins = [
  process.env.NEXT_PUBLIC_SERVER_URL,
  'https://admin.aurin.mx',
  'https://www.admin.aurin.mx',
  'https://aurin-payload-cms.vercel.app',
  'http://localhost:3000',
].filter((o): o is string => Boolean(o))

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- Aurin CMS',
    },
  },
  
  // Configuración i18n
  localization: {
    locales: [
      {
        label: 'Español',
        code: 'es',
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'es',
    fallback: true,
  },
  
  collections: [Users, Media, Projects, Categories, Tags],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    connectOptions: {
      maxPoolSize: 10, // Límite de conexiones para serverless
      minPoolSize: 2,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 5000,
    },
  }),
  sharp,

  // Configuración de rutas
  routes: {
    admin: '/admin',
    api: '/api',
  },

  // CORS y CSRF comparten la lista: un origen fuera de ella no puede guardar ("You are not allowed…")
  cors: allowedOrigins,
  csrf: allowedOrigins,

  plugins: [
    // Vercel Blob Storage
    ...(process.env.BLOB_READ_WRITE_TOKEN ? [
      vercelBlobStorage({
        enabled: true,
        collections: {
          media: true,
        },
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: true,
        cacheControlMaxAge: 365 * 24 * 60 * 60, // 1 año de caché
      })
    ] : []),
  ],
})
