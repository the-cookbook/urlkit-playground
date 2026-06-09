import { createHighlighter } from "shiki"

export type HighlightLanguage = "typescript" | "json"

type ShikiHighlighter = Awaited<ReturnType<typeof createHighlighter>>

let highlighterPromise: Promise<ShikiHighlighter> | undefined
const highlightedHtmlCache = new Map<string, Promise<string> | string>()

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
  const cacheKey = `${theme}:${lang}:${source}`
  const cachedHtml = highlightedHtmlCache.get(cacheKey)

  if (cachedHtml) {
    return cachedHtml
  }

  const highlightedHtmlPromise = getHighlighter().then((highlighter) =>
    highlighter.codeToHtml(source, {
      lang,
      theme: theme === "light" ? "light-plus" : "nord",
    })
  )

  highlightedHtmlCache.set(cacheKey, highlightedHtmlPromise)

  try {
    const highlightedHtml = await highlightedHtmlPromise
    highlightedHtmlCache.set(cacheKey, highlightedHtml)

    return highlightedHtml
  } catch (error) {
    highlightedHtmlCache.delete(cacheKey)
    throw error
  }
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
