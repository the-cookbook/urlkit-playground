import type { UnknownSearchBehavior } from "@cookbook/urlkit"

export type ArrayFormat = "repeat" | "comma"
export type InvalidSearchBehavior = "error" | "omit"
export type BuildDefaults = "include" | "omit"
export type ProductSort =
  | "recommendation"
  | "desc"
  | "asc"
  | "priceDesc"
  | "priceAsc"
export type ProductHash = "grid" | "list"

export interface PlaygroundContract {
  parse(input: string | URL, options?: unknown): unknown
  safeParse(input: string | URL, options?: unknown): unknown
  build(input: unknown, options?: unknown): string
  match(input: string | URL, options?: unknown): boolean
  parseSearch(input: string | URLSearchParams, options?: unknown): unknown
  buildSearch(search: unknown, options?: unknown): string
  parseHash(input: unknown): unknown
  buildHash(hash?: unknown, options?: unknown): string
  withSearch(input: string | URL, search: unknown, options?: unknown): string
  replaceSearch(input: string | URL, search: unknown, options?: unknown): string
  omitSearch(
    input: string | URL,
    keys: readonly string[],
    options?: unknown
  ): string
  pickSearch(
    input: string | URL,
    keys: readonly string[],
    options?: unknown
  ): string
}

export interface DemoResult {
  readonly label: string
  readonly value: unknown
}

export interface ScenarioConfig {
  readonly label: string
  readonly kind: "valid" | "invalid" | "option" | "date"
  readonly value: string
  readonly description: string
  readonly options?: Partial<{
    readonly unknownSearch: UnknownSearchBehavior
    readonly arrayFormat: ArrayFormat
    readonly invalidSearch: InvalidSearchBehavior
  }>
}

export interface ExampleButtonConfig {
  readonly label: string
  readonly value: string
}

export type FieldKind =
  | "string"
  | "number"
  | "int"
  | "boolean"
  | "date"
  | "dateTime"
  | "array"
  | "enum"
  | "object"

export type BuildFieldSource = "param" | "search" | "hash"
export type HelperTab =
  | "parseSearch"
  | "withSearch"
  | "replaceSearch"
  | "omitSearch"
  | "pickSearch"
  | "parseHash"

export interface HelperKeysState {
  readonly omitSearch: string
  readonly pickSearch: string
}

export interface PlaygroundFieldMeta {
  readonly kind: FieldKind
  readonly optional: boolean
  readonly hasDefault: boolean
  readonly defaultValue?: unknown
  readonly values?: readonly string[]
  readonly item?: PlaygroundFieldMeta
  readonly shape?: Readonly<Record<string, PlaygroundFieldMeta>>
  readonly format?: unknown
}

export interface PlaygroundParamMeta {
  readonly name: string
  readonly optional: boolean
  readonly kind: "string" | "number" | "int"
}

export interface PlaygroundContractMeta {
  readonly path?: string
  readonly params: readonly PlaygroundParamMeta[]
  readonly search: Readonly<Record<string, PlaygroundFieldMeta>>
  readonly hash?: PlaygroundFieldMeta
}

export interface AppliedArticleContract {
  readonly contract: PlaygroundContract
  readonly meta: PlaygroundContractMeta
}

export interface RuntimeSchemaBuilderLike {
  optional(): RuntimeSchemaBuilderLike
  required(): RuntimeSchemaBuilderLike
  default(value: unknown): RuntimeSchemaBuilderLike
}

export interface RuntimeUrlDescriptorLike {
  readonly path?: string
  readonly search?: Readonly<Record<string, RuntimeSchemaBuilderLike>>
  readonly hash?: RuntimeSchemaBuilderLike
}

export const schemaMetaSymbol: unique symbol = Symbol(
  "urlkit.playground.schemaMeta"
)

export interface SchemaWithMeta extends RuntimeSchemaBuilderLike {
  readonly [schemaMetaSymbol]: PlaygroundFieldMeta
}

export interface BuildControlState {
  readonly source: BuildFieldSource
  readonly key: string
  readonly meta: PlaygroundFieldMeta
  readonly value: string
}

export interface BuildStateInput {
  params?: Record<string, unknown>
  search: Record<string, unknown>
  hash?: unknown
}

export interface ParseOptionsState {
  readonly unknownSearch: UnknownSearchBehavior
  readonly arrayFormat: ArrayFormat
  readonly invalidSearch: InvalidSearchBehavior
}

export interface BuildOptionsState {
  readonly defaults: BuildDefaults
  readonly arrayFormat: ArrayFormat
}

export interface ProductOptionsState {
  readonly unknownSearch: UnknownSearchBehavior
  readonly arrayFormat: ArrayFormat
}

export interface DocsItem {
  readonly name: string
  readonly signature?: string
  readonly description: string
  readonly details?: readonly string[]
  readonly example?: string
}

export interface DocsSection {
  readonly title: string
  readonly description?: string
  readonly items: readonly DocsItem[]
}
