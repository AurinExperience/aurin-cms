// Arriba del menú: volver al panel y abrir el sitio público
export const NavLinks = () => (
  <div className="aurin-nav-top">
    <a className="nav__link" id="nav-dashboard" href="/admin">
      <span className="nav__link-label">Panel de control</span>
    </a>
    <a
      className="nav__link"
      id="nav-site"
      href={process.env.WEBSITE_URL || 'https://aurin.mx'}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="nav__link-label">Ver sitio web ↗</span>
    </a>
  </div>
)
