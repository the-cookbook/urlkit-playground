import { UrlKitError } from "@cookbook/urlkit"

import type {
  DemoResult,
  PlaygroundFieldMeta,
  PlaygroundParamMeta,
} from "@/contracts"

export function formatErrorMessage(error: unknown): string {
  if (error instanceof UrlKitError) {
    const path = error.path ? ` at ${error.path.join(".")}` : ""
    return `${error.code}${path}: ${error.message}`
  }

  return error instanceof Error ? error.message : String(error)
}

export function normalizeForDisplay(value: unknown): unknown {
  if (value instanceof UrlKitError) {
    return {
      name: value.name,
      code: value.code,
      path: value.path,
      message: value.message,
      cause: value.cause instanceof Error ? value.cause.message : undefined,
    }
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    }
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeForDisplay(item))
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, innerValue]) => [
        key,
        normalizeForDisplay(innerValue),
      ])
    )
  }

  return value
}

export function formatValue(value: unknown): string {
  return JSON.stringify(normalizeForDisplay(value), null, 2)
}

export function capture(operation: () => unknown): unknown {
  try {
    return operation()
  } catch (error) {
    if (error instanceof UrlKitError || error instanceof Error) {
      return error
    }

    throw error
  }
}

export function renderResultsAsSource(results: readonly DemoResult[]): string {
  return results
    .map((result) => `// ${result.label}\n${formatValue(result.value)}`)
    .join("\n\n")
}

export function formatParamSummary(
  params: readonly PlaygroundParamMeta[]
): React.ReactNode {
  if (!params.length) return "none"

  return params.map((param) => (
    <p key={param.name} className="block py-0.5">
      {param.name}:<span className="text-muted-foreground">{param.kind}</span>
      {param.optional && (
        <span className="text-amber-500 dark:text-amber-300">?</span>
      )}
    </p>
  ))
}

export function formatSearchSummary(
  search: Readonly<Record<string, PlaygroundFieldMeta>>
): React.ReactNode {
  const entries = Object.entries(search)

  if (!entries.length) {
    return "none"
  }

  return entries.map(([key, meta]) => (
    <p key={key} className="block py-0.5">
      {key}:{formatFieldSummary(meta)}
    </p>
  ))
}

export function formatFieldSummary(
  meta: PlaygroundFieldMeta | undefined
): React.ReactNode {
  if (!meta) {
    return "none"
  }

  if (meta.kind === "array") {
    return (
      <>
        <span className="text-muted-foreground">
          {formatFieldSummary(meta.item)}[]
        </span>
        {formatPresenceSummary(meta)}
      </>
    )
  }

  if (meta.kind === "enum") {
    return (
      <>
        <span className="text-muted-foreground">
          enum({meta.values?.join(" | ") ?? ""})
        </span>
        {formatPresenceSummary(meta)}
      </>
    )
  }

  return (
    <>
      <span className="text-muted-foreground">{meta.kind}</span>
      {formatPresenceSummary(meta)}
    </>
  )
}

export function formatPresenceSummary(
  meta: PlaygroundFieldMeta
): React.ReactNode {
  if (meta.hasDefault) {
    return (
      <>
        =
        <span className="text-emerald-600 dark:text-emerald-400">
          {formatCompactValue(meta.defaultValue)}
        </span>
      </>
    )
  }

  return meta.optional ? (
    <span className="text-amber-500 dark:text-amber-300">?</span>
  ) : (
    ""
  )
}

export function formatCompactValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString()
  }

  return typeof value === "string" ? value : JSON.stringify(value)
}
