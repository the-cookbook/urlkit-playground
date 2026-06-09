import type {
  BuildControlState,
  BuildStateInput,
  PlaygroundContractMeta,
  PlaygroundFieldMeta,
  PlaygroundParamMeta,
} from "@/contracts"
import { formatCompactValue, formatFieldSummary } from "./format"

export function createBuildControls(
  meta: PlaygroundContractMeta
): readonly BuildControlState[] {
  const controls: BuildControlState[] = []

  for (const param of meta.params) {
    const fieldMeta = createFieldMetaFromParam(param)
    controls.push({
      source: "param",
      key: param.name,
      meta: fieldMeta,
      value: formatBuildInitialValue(fieldMeta, param.name, "param"),
    })
  }

  for (const [key, fieldMeta] of Object.entries(meta.search)) {
    controls.push({
      source: "search",
      key,
      meta: fieldMeta,
      value: formatBuildInitialValue(fieldMeta, key, "search"),
    })
  }

  if (meta.hash) {
    controls.push({
      source: "hash",
      key: "hash",
      meta: meta.hash,
      value: formatBuildInitialValue(meta.hash, "hash", "hash"),
    })
  }

  return controls
}

export function updateBuildControl(
  controls: readonly BuildControlState[],
  source: BuildControlState["source"],
  key: string,
  value: string
): readonly BuildControlState[] {
  return controls.map((control) =>
    control.source === source && control.key === key
      ? { ...control, value }
      : control
  )
}

export function createBuildStateInput(
  controls: readonly BuildControlState[]
): BuildStateInput {
  const params: Record<string, unknown> = {}
  const search: Record<string, unknown> = {}
  let hash: unknown

  for (const control of controls) {
    const value = readBuildInputValue(control.value, control.meta)

    if (value === undefined) {
      continue
    }

    if (control.source === "param") {
      params[control.key] = value
      continue
    }

    if (control.source === "hash") {
      hash = value
      continue
    }

    search[control.key] = value
  }

  return {
    ...(Object.keys(params).length ? { params } : {}),
    search,
    ...(hash === undefined ? {} : { hash }),
  }
}

export function createFieldMetaFromParam(
  param: PlaygroundParamMeta
): PlaygroundFieldMeta {
  return {
    kind: param.kind,
    optional: false,
    hasDefault: false,
  }
}

export function formatBuildFieldDescription(meta: PlaygroundFieldMeta): string {
  const presence = meta.hasDefault
    ? `default ${formatCompactValue(meta.defaultValue)}`
    : meta.optional
      ? "optional"
      : "required"

  if (meta.kind === "array") {
    return `${formatFieldSummary(meta.item)} array, CSV input, ${presence}`
  }

  if (meta.kind === "enum") {
    return `enum values: ${meta.values?.join(", ") ?? "none"}; ${presence}`
  }

  if (meta.kind === "date") {
    return `Date value; ${presence}`
  }

  if (meta.kind === "dateTime") {
    return `Date-time value; ${presence}`
  }

  return `${meta.kind}; ${presence}`
}

export function formatBuildPlaceholder(meta: PlaygroundFieldMeta): string {
  if (meta.kind === "array") {
    return "value one, value two"
  }

  if (meta.kind === "date") {
    return "2026-06-02"
  }

  if (meta.kind === "dateTime") {
    return "2026-06-02T12:30:05.000Z"
  }

  return ""
}

function formatBuildInitialValue(
  meta: PlaygroundFieldMeta,
  key: string,
  source: BuildControlState["source"]
): string {
  if (meta.hasDefault) {
    return formatBuildValue(meta.defaultValue, meta)
  }

  if (source === "hash" && meta.kind === "enum") {
    return meta.values?.[0] ?? "omit"
  }

  return sampleValueForMeta(meta, key)
}

function sampleValueForMeta(meta: PlaygroundFieldMeta, key: string): string {
  if (meta.kind === "array") {
    return sampleArrayValue(meta.item)
  }

  if (meta.kind === "enum") {
    return meta.values?.[0] ?? "omit"
  }

  if (meta.kind === "boolean") {
    return "true"
  }

  if (meta.kind === "int") {
    return key.toLowerCase() === "id" ? "42" : "3"
  }

  if (meta.kind === "number") {
    return "9.5"
  }

  if (meta.kind === "date") {
    return "2026-06-02"
  }

  if (meta.kind === "dateTime") {
    return "2026-06-02T12:30:05.000Z"
  }

  if (meta.kind === "object") {
    return JSON.stringify({}, null, 2)
  }

  return key.toLowerCase().includes("slug") ? "hello-urlkit" : "example"
}

function sampleArrayValue(item: PlaygroundFieldMeta | undefined): string {
  if (!item) {
    return "one, two"
  }

  if (item.kind === "enum") {
    return item.values?.slice(0, 2).join(", ") || "one, two"
  }

  if (item.kind === "int") {
    return "1, 2"
  }

  if (item.kind === "number") {
    return "1.5, 2.5"
  }

  if (item.kind === "boolean") {
    return "true, false"
  }

  return "ts, urlkit"
}

function formatBuildValue(value: unknown, meta: PlaygroundFieldMeta): string {
  if (value === undefined || value === null) {
    return "omit"
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map(String).join(", ")
  }

  if (meta.kind === "object" && typeof value === "object") {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}

function readBuildInputValue(
  rawValue: string,
  meta: PlaygroundFieldMeta
): unknown {
  const raw = rawValue.trim()

  if (raw === "omit") {
    return undefined
  }

  if (meta.kind === "array") {
    return readArrayValue(raw, meta.item)
  }

  if (meta.kind === "int" || meta.kind === "number") {
    return raw ? Number(raw) : undefined
  }

  if (meta.kind === "boolean") {
    return raw ? raw === "true" : undefined
  }

  if (meta.kind === "date" || meta.kind === "dateTime") {
    return optionalDateValue(raw)
  }

  if (meta.kind === "object") {
    return raw ? JSON.parse(raw) : undefined
  }

  return raw || undefined
}

function readArrayValue(
  raw: string,
  item: PlaygroundFieldMeta | undefined
): readonly unknown[] | undefined {
  const values = splitCsv(raw)

  if (!values) {
    return undefined
  }

  return values.map((value) => readScalarArrayItem(value, item))
}

function readScalarArrayItem(
  value: string,
  item: PlaygroundFieldMeta | undefined
): unknown {
  if (item?.kind === "int" || item?.kind === "number") {
    return Number(value)
  }

  if (item?.kind === "boolean") {
    return value === "true"
  }

  if (item?.kind === "date" || item?.kind === "dateTime") {
    return optionalDateValue(value)
  }

  return value
}

function splitCsv(value: string): readonly string[] | undefined {
  const values = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  return values.length ? values : undefined
}

function optionalDateValue(value: string): Date | undefined {
  const next = value.trim()

  if (!next) {
    return undefined
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(next)) {
    return new Date(`${next}T00:00:00.000Z`)
  }

  return new Date(next)
}
