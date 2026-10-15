'use client'
import type React from 'react'
import type { TextFieldClientComponent } from 'payload'
import { TextInput, useField } from '@payloadcms/ui'

const HEX = /^#[0-9a-f]{6}$/i

// Campo de texto con el selector de color del navegador a un lado: se elige con el
// gotero o se pega el código (#D0DF00).
export const ColorField: TextFieldClientComponent = ({ field, path }) => {
  const { value = '', setValue, showError } = useField<string>({ path })
  // Sin valor (proyectos de antes de este campo), la muestra enseña el color que la web usa por defecto
  const placeholder = field.admin?.placeholder
  const fallback = typeof placeholder === 'string' ? placeholder : '#000000'

  return (
    <TextInput
      path={path}
      label={field.label || undefined}
      description={field.admin?.description}
      required={field.required}
      placeholder={fallback}
      value={value}
      showError={showError}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value.trim())}
      BeforeInput={
        <input
          type="color"
          className="aurin-color-swatch"
          aria-label="Elegir color"
          value={HEX.test(value) ? value : fallback}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
        />
      }
    />
  )
}
