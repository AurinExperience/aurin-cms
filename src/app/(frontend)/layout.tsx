import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Panel de administración de contenidos de Aurin.',
  title: 'Aurin CMS',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
