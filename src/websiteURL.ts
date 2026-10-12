// URL pública de la web (AurinWebsite): preview, "Ver sitio web", SEO y aviso de caché.
// Si WEBSITE_URL no es una URL http(s) (p. ej. un secreto pegado en la variable equivocada)
// se ignora; si no, el preview abría admin.aurin.mx/<valor>/preview/… y daba 404.
const fromEnv = process.env.WEBSITE_URL?.trim().replace(/\/+$/, '')

export const websiteURL =
  fromEnv && /^https?:\/\/[^/]+/.test(fromEnv)
    ? fromEnv
    : process.env.NODE_ENV === 'production'
      ? 'https://aurin.mx'
      : 'http://localhost:4321'
