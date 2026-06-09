import * as React from "react"

import { useTheme } from "@/components/theme-provider"
import { escapeHtml, highlightCode, type HighlightLanguage } from "@/lib/shiki"

interface CodeBlockProps {
  readonly code: string
  readonly lang?: HighlightLanguage
  readonly className?: string
}

export function CodeBlock({
  code,
  lang = "typescript",
  className = "",
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const [html, setHtml] = React.useState(
    () => `<pre><code>${escapeHtml(code)}</code></pre>`
  )

  React.useEffect(() => {
    let cancelled = false

    highlightCode(code, resolvedTheme, lang)
      .then((nextHtml) => {
        if (!cancelled) {
          setHtml(nextHtml)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHtml(`<pre><code>${escapeHtml(code)}</code></pre>`)
        }
      })

    return () => {
      cancelled = true
    }
  }, [code, lang, resolvedTheme])

  return (
    <div
      className={`code-output shiki-output [&_code]:whitespace-inherit [&_pre]:wrap-break-words overflow-hidden rounded-sm text-sm [&_pre]:px-2 [&_pre]:whitespace-pre-wrap [&_pre]:first:pt-2 [&_pre]:last:pb-2 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
