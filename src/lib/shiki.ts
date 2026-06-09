import { createHighlighter } from "shiki"

export type HighlightLanguage = "typescript" | "json"

type ShikiHighlighter = Awaited<ReturnType<typeof createHighlighter>>

let highlighterPromise: Promise<ShikiHighlighter> | undefined

export function getHighlighter(): Promise<ShikiHighlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["light-plus", "nord"],
      langs: ["json", "typescript"],
    })
  }

  return highlighterPromise
}

export async function highlightCode(
  source: string,
  theme: "dark" | "light",
  lang: HighlightLanguage = "typescript"
) {
  const highlighter = await getHighlighter()

  return highlighter.codeToHtml(source, {
    lang,
    theme: theme === "light" ? "light-plus" : "nord",
  })
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
