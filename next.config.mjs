import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel lo da al compilar; el admin lo usa para notar que hubo otro deploy (NewVersionNotice)
  env: { NEXT_PUBLIC_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID ?? '' },
  // Solo el Dockerfile lo pide (server.js autocontenido); en Vercel queda sin definir
  output: process.env.NEXT_OUTPUT,
  // Este proyecto solo sirve el admin y la API: la raíz manda al admin
  async redirects() {
    return [{ source: '/', destination: '/admin', permanent: false }]
  },
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig)
