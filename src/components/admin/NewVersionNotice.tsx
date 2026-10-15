'use client'
import { useEffect, useState, type ReactNode } from 'react'

// Deploy con el que se cargó esta pestaña (lo fija next.config.mjs al compilar; vacío en local)
const loadedDeployment = process.env.NEXT_PUBLIC_DEPLOYMENT_ID

// Tras un deploy, una pestaña abierta del admin sigue con el código viejo: sus llamadas al
// servidor ya no existen y subir imágenes o guardar se queda cargando hasta recargar.
// Sin Skew Protection (plan Hobby) avisamos para recargar antes de perder cambios.
export const NewVersionNotice = ({ children }: { children: ReactNode }) => {
  const [outdated, setOutdated] = useState(false)

  useEffect(() => {
    if (!loadedDeployment) return
    const check = () =>
      fetch('/api/version', { cache: 'no-store' })
        .then((res) => res.json())
        .then(({ deployment }) => setOutdated(Boolean(deployment) && deployment !== loadedDeployment))
        .catch(() => {})
    const timer = setInterval(check, 60_000)
    window.addEventListener('focus', check)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', check)
    }
  }, [])

  return (
    <>
      {children}
      {outdated && (
        <div className="aurin-new-version" role="alert">
          <span>
            Se publicó una versión nueva del CMS. Guarda lo que estés editando y recarga la página antes de
            subir imágenes.
          </span>
          <button type="button" onClick={() => window.location.reload()}>
            Recargar
          </button>
        </div>
      )}
    </>
  )
}
