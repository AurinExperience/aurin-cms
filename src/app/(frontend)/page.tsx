import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo" src="/aurin-logo.svg" alt="Aurin" width={272} height={49} />
      <h1>{user ? `Hola de nuevo, ${user.email}` : 'Panel de administración'}</h1>
      <p>Gestiona los proyectos y contenidos del sitio de Aurin.</p>
      <a className="button" href={payloadConfig.routes.admin}>
        {user ? 'Ir al panel' : 'Acceder al panel'}
      </a>
    </div>
  )
}
