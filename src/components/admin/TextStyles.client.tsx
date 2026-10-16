'use client'
import type { ToolbarGroup } from '@payloadcms/richtext-lexical'
import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import {
  $getNodeByKey,
  $getState,
  $isRangeSelection,
  $isTextNode,
  $setState,
  createState,
  TextNode,
  type BaseSelection,
  type LexicalEditor,
} from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $forEachSelectedTextNode } from '@payloadcms/richtext-lexical/lexical/selection'
import { useEffect } from 'react'
import type { TextStyleGroup } from './textStyles'

// Un menú por grupo (Tipografía, Tamaño…) con el valor actual en el botón, como en Google Docs.
// Mismo formato que TextStateFeature de Payload (`$` en el nodo de texto); lo hacemos propio
// porque ese pone todo en un solo menú de la "A" y no dice qué estilo tiene la selección.

type StateConfig = ReturnType<typeof createState<string, string | undefined>>

const selectedTextNodes = (selection: BaseSelection | null) =>
  $isRangeSelection(selection) ? selection.getNodes().filter($isTextNode) : []

function toolbarGroups(groups: TextStyleGroup[], states: Map<string, StateConfig>): ToolbarGroup[] {
  const apply = (editor: LexicalEditor, key: string, value: string | undefined) =>
    editor.update(() => $forEachSelectedTextNode((node) => $setState(node, states.get(key)!, value)))

  return groups.map((group) => ({
    type: 'dropdown',
    key: `aurin-${group.key}`,
    order: group.order,
    // Sin estilo propio el botón dice qué menú es; con uno, Payload muestra la opción activa
    ChildComponent: () => <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{group.label}</span>,
    items: [
      {
        key: `aurin-${group.key}-clear`,
        label: 'Quitar',
        order: 0,
        onSelect: ({ editor }) => apply(editor, group.key, undefined),
      },
      ...group.options.map((option, i) => ({
        key: `aurin-${group.key}-${option.value}`,
        label: option.label,
        order: i + 1,
        ChildComponent: () => <span style={{ ...cssToReact(option.css), fontSize: 14, lineHeight: 1 }}>Aa</span>,
        isActive: ({ selection }: { selection: BaseSelection }) => {
          const nodes = selectedTextNodes(selection)
          return nodes.length > 0 && nodes.every((node) => $getState(node, states.get(group.key)!) === option.value)
        },
        onSelect: ({ editor }: { editor: LexicalEditor }) => apply(editor, group.key, option.value),
      })),
    ],
  }))
}

const cssToReact = (css: Record<string, string>) =>
  Object.fromEntries(Object.entries(css).map(([k, v]) => [k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v]))

// Pinta en el editor los estilos guardados en cada texto (Lexical no los conoce)
function StylesPlugin({ groups, states }: { groups: TextStyleGroup[]; states: Map<string, StateConfig> }) {
  const [editor] = useLexicalComposerContext()
  useEffect(
    () =>
      editor.registerMutationListener(TextNode, (mutated) => {
        editor.getEditorState().read(() => {
          for (const [key, mutation] of mutated) {
            const node = $getNodeByKey(key)
            const dom = editor.getElementByKey(key)
            if (mutation === 'destroyed' || !node || !dom) continue
            const css: Record<string, string> = {}
            for (const group of groups) {
              const value = $getState(node, states.get(group.key)!)
              Object.assign(css, group.options.find((o) => o.value === value)?.css)
            }
            dom.style.cssText = Object.entries(css)
              .map(([k, v]) => `${k}:${v}`)
              .join(';')
          }
        })
      }),
    [editor, groups, states],
  )
  return null
}

export const TextStylesClient = createClientFeature<{ groups: TextStyleGroup[] }>(({ props }) => {
  const states = new Map(
    props.groups.map((group) => [
      group.key,
      createState(group.key, {
        parse: (v) => (typeof v === 'string' && group.options.some((o) => o.value === v) ? v : undefined),
      }),
    ]),
  )
  const groups = toolbarGroups(props.groups, states)
  return {
    plugins: [{ Component: () => <StylesPlugin groups={props.groups} states={states} />, position: 'normal' }],
    toolbarFixed: { groups },
    toolbarInline: { groups },
  }
})
