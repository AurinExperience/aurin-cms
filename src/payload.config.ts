// storage-adapter-import-placeholder
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { resendAdapter } from '@payloadcms/email-resend'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { es } from '@payloadcms/translations/languages/es'
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
import {
  generateProjectDescription,
  generateProjectTitle,
  isUsableShareImage,
} from './seo/projectSeo'

const allowedOrigins = [
  process.env.NEXT_PUBLIC_SERVER_URL,
  'https://admin.aurin.mx',
  'https://www.admin.aurin.mx',
  'https://aurin-payload-cms.vercel.app',
  'http://localhost:3000',
].filter((o): o is string => Boolean(o))

const websiteURL = process.env.WEBSITE_URL || 'https://aurin.mx'

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
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/aurin-icon.svg' }],
    },
    components: {
      beforeNavLinks: ['/components/admin/NavLinks#NavLinks'],
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Icon#Icon',
      },
    },
  },

  // Correo para "¿Olvidaste tu contraseña?". Sin RESEND_API_KEY los correos solo se imprimen en el log.
  ...(process.env.RESEND_API_KEY && {
    email: resendAdapter({
      apiKey: process.env.RESEND_API_KEY,
      defaultFromAddress: process.env.EMAIL_FROM || 'cms@aurin.mx',
      defaultFromName: 'Aurin CMS',
    }),
  }),

  // Admin en español (menús, botones, mensajes)
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
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
  
  // Orden del menú: Contenido (Proyectos, Archivos) y luego Ajustes (Usuarios)
  collections: [Projects, Media, Users, Categories, Tags],
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
    // Solo aporta los botones de autogenerar, los textos y la vista previa de Google.
    // Sus campos se usan dentro del grupo `seo` de Projects (ver collections/Projects.ts).
    seoPlugin({
      collections: ['projects'],
      uploadsCollection: 'media',
      generateTitle: ({ doc, locale }) =>
        generateProjectTitle({
          title: doc?.title,
          services: doc?.hero?.services?.map((s: { name?: string }) => s?.name ?? '') ?? [],
          locale: locale === 'en' ? 'en' : 'es',
        }),
      generateDescription: ({ doc, locale }) =>
        generateProjectDescription({
          description: doc?.hero?.description,
          services: doc?.hero?.services?.map((s: { name?: string }) => s?.name ?? '') ?? [],
          client: doc?.client?.name,
          locale: locale === 'en' ? 'en' : 'es',
        }),
      // Solo propone la imagen principal si sirve para compartir; si no, deja la que ya hay
      generateImage: async ({ doc, req }) => {
        const current = doc?.seo?.ogImage?.id ?? doc?.seo?.ogImage ?? ''
        const bannerID = doc?.hero?.bannerImage?.id ?? doc?.hero?.bannerImage
        if (!bannerID) return current
        const banner = await req.payload
          .findByID({ collection: 'media', id: bannerID, depth: 0, disableErrors: true })
          .catch(() => null)
        return isUsableShareImage(banner) ? bannerID : current
      },
      generateURL: ({ doc, locale }) =>
        `${websiteURL}${locale === 'en' ? '/en' : ''}/project/${encodeURIComponent(doc?.slug ?? '')}`,
    }),
    // seoPlugin además agrega su propio grupo `meta`; se quita para no duplicar campos
    (config) => ({
      ...config,
      collections: config.collections?.map((collection) =>
        collection.slug === 'projects'
          ? { ...collection, fields: collection.fields.filter((field) => !('name' in field && field.name === 'meta')) }
          : collection,
      ),
    }),
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
