'use client'
import type { RadioFieldClientComponent } from 'payload'
import { FieldDescription, FieldLabel, useField } from '@payloadcms/ui'

// "Cómo se muestran" de la galería: dos tarjetas con un dibujo de cada modo en vez de
// radios con texto, para elegir de un vistazo. Las opciones salen del config (Projects.ts).
const HINTS: Record<string, string> = {
  slider: 'Una a la vez, se deslizan.',
  masonry: 'Todas a la vista; clic para ampliar.',
}

const PREVIEWS: Record<string, React.ReactNode> = {
  slider: (
    <svg viewBox="0 0 120 64" aria-hidden="true">
      <rect x="14" y="6" width="92" height="42" rx="3" fill="currentColor" opacity="0.9" />
      <rect x="2" y="12" width="8" height="30" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="110" y="12" width="8" height="30" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="48" y="56" width="10" height="3" rx="1.5" fill="currentColor" />
      <circle cx="64" cy="57.5" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="70" cy="57.5" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  ),
  masonry: (
    <svg viewBox="0 0 120 64" aria-hidden="true" fill="currentColor">
      <rect x="2" y="2" width="36" height="22" rx="2" opacity="0.9" />
      <rect x="2" y="27" width="36" height="35" rx="2" opacity="0.5" />
      <rect x="42" y="2" width="36" height="34" rx="2" opacity="0.6" />
      <rect x="42" y="39" width="36" height="23" rx="2" opacity="0.9" />
      <rect x="82" y="2" width="36" height="16" rx="2" opacity="0.5" />
      <rect x="82" y="21" width="36" height="41" rx="2" opacity="0.8" />
    </svg>
  ),
}

export const GalleryLayoutField: RadioFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })
  // Proyectos de antes de este campo no tienen valor: la web los muestra en slider
  const current = value || 'slider'

  return (
    <div className="field-type aurin-layout-field">
      <FieldLabel label={field.label} path={path} />
      <div className="aurin-layout-options" role="radiogroup">
        {field.options.map((option) => {
          const { label, value: optionValue } = typeof option === 'string' ? { label: option, value: option } : option
          const checked = current === optionValue
          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={checked}
              className="aurin-layout-option"
              onClick={() => setValue(optionValue)}
            >
              {PREVIEWS[optionValue]}
              <strong>{String(label)}</strong>
              <span>{HINTS[optionValue]}</span>
            </button>
          )
        })}
      </div>
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
