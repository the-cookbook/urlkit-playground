import type {
  DocsSection,
  ExampleButtonConfig,
  ScenarioConfig,
} from "@/contracts"

export const playgroundHero = {
  eyebrow: "@cookbook/urlkit",
  title: "URLKit playground",
  description: (
    <>
      Edit the URLKit contract, then test{" "}
      <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">parse()</code>
      ,{" "}
      <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">
        safeParse()
      </code>
      ,{" "}
      <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">match()</code>
      ,{" "}
      <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">build()</code>
      , search helpers, hash helpers, and pathless URL behavior from the same
      rules.
    </>
  ),
  badges: [
    "path params",
    "search params",
    "arrays",
    "enums",
    "dates",
    "hash",
    "pathless",
    "safe errors",
  ],
} as const

export const docsSections: readonly DocsSection[] = [
  {
    title: "Schema builders",
    description:
      "Runtime helpers available inside the editable contract editor.",
    items: [
      {
        name: "string()",
        signature: "string(): RuntimeSchemaBuilder<string>",
        description: "Parses and serializes string values.",
        example: "slug: string()",
      },
      {
        name: "number()",
        signature: "number(): RuntimeSchemaBuilder<number>",
        description: "Parses finite numeric values.",
        example: "score: number().optional()",
      },
      {
        name: "int()",
        signature: "int(): RuntimeSchemaBuilder<number>",
        description: "Parses integer values and rejects decimals.",
        example: "page: int().default(1)",
      },
      {
        name: "boolean()",
        signature: "boolean(): RuntimeSchemaBuilder<boolean>",
        description: "Parses strict boolean query values.",
        details: ["Use true or false in serialized search params."],
        example: "featured: boolean().optional()",
      },
      {
        name: "date()",
        signature: "date(options?): RuntimeSchemaBuilder<Date>",
        description:
          "Parses date-only values. Custom format strings and explicit codecs are supported.",
        example: "publishedOn: date({ format: 'dd-MM-yyyy' }).optional()",
      },
      {
        name: "dateTime()",
        signature: "dateTime(options?): RuntimeSchemaBuilder<Date>",
        description:
          "Parses UTC date-time values and custom UTC-looking date-time formats.",
        example:
          "scheduledAt: dateTime({ format: \"dd-MM-yyyy'T'HH:mm:ss'Z'\" }).optional()",
      },
      {
        name: "array(schema)",
        signature: "array(schema): RuntimeSchemaBuilder<readonly Value[]>",
        description:
          "Parses repeated or comma-separated values depending on arrayFormat.",
        example: "tag: array(string()).optional()",
      },
      {
        name: "enumOf(values)",
        signature: "enumOf(['newest', 'popular'])",
        description: "Restricts a field to one of the declared string values.",
        example: "sort: enumOf(['newest', 'popular']).default('newest')",
      },
      {
        name: "object(shape)",
        signature: "object({ nested: string() })",
        description:
          "Hydrates declared nested object fields from dot-notation search keys.",
      },
    ],
  },
  {
    title: "Schema methods",
    items: [
      {
        name: ".optional()",
        description:
          "Allows missing input and normalizes the parsed value to undefined.",
        example: "tag: array(string()).optional()",
      },
      {
        name: ".required()",
        description: "Marks a field as required when no default exists.",
        example: "id: int().required()",
      },
      {
        name: ".default(value)",
        description:
          "Applies a default during parse() and normalize(). Defaults are the strongest presence rule.",
        details: [
          "build() serializes what it receives.",
          "Use build options defaults: 'omit' to remove values equal to defaults.",
        ],
        example: "page: int().default(1)",
      },
    ],
  },
  {
    title: "Contract methods",
    items: [
      {
        name: "parse(input, options?)",
        description:
          "Parses serialized URL input and throws UrlKitError for invalid values.",
      },
      {
        name: "safeParse(input, options?)",
        description:
          "Parses serialized URL input and returns a success/error result without throwing.",
      },
      {
        name: "normalize(input, options?)",
        description: "Normalizes structured URL state and applies defaults.",
      },
      {
        name: "build(input, options?)",
        description:
          "Serializes typed URL state into an href. It does not invent missing defaults.",
      },
      {
        name: "match(input, options?)",
        description:
          "Returns true when the serialized URL satisfies the contract.",
      },
      {
        name: "parseSearch(input, options?)",
        description: "Parses and validates only the search part of a URL.",
      },
      {
        name: "buildSearch(search, options?)",
        description: "Serializes typed search state into a query string.",
      },
      {
        name: "withSearch(input, patch, options?)",
        description:
          "Patches the existing search params while preserving the rest of the URL.",
      },
      {
        name: "replaceSearch(input, search, options?)",
        description:
          "Replaces the current search params with typed search state.",
      },
      {
        name: "omitSearch(input, keys, options?)",
        description: "Removes selected search keys from the URL.",
      },
      {
        name: "pickSearch(input, keys, options?)",
        description: "Keeps only selected search keys in the URL.",
      },
      {
        name: "parseHash(input)",
        description:
          "Parses and validates a hash fragment from a full URL or hash value.",
      },
      {
        name: "buildHash(hash, options?)",
        description: "Serializes a typed hash value into a hash fragment.",
      },
    ],
  },
  {
    title: "Options",
    items: [
      {
        name: "unknownSearch",
        signature: "'strip' | 'preserve' | 'error'",
        description: "Controls undeclared search params. Default is strip.",
      },
      {
        name: "arrayFormat",
        signature: "'repeat' | 'comma'",
        description:
          "Controls whether arrays use repeated params or comma-separated values.",
      },
      {
        name: "invalidSearch",
        signature: "'error' | 'omit'",
        description:
          "Allows recoverable invalid optional/defaulted fields to be omitted instead of throwing.",
      },
      {
        name: "defaults",
        signature: "'include' | 'omit'",
        description:
          "Controls whether provided values equal to defaults are serialized by build helpers.",
      },
    ],
  },
]

export const initialContractCode = `const ArticleUrl = url({
  path: '/articles/{id:int}',
  search: {
    page: int().default(1),
    tag: array(string()).optional(),
    sort: enumOf(['newest', 'popular']).default('newest'),
    featured: boolean().optional(),
    score: number().optional(),
    publishedOn: date({ format: 'dd-MM-yyyy' }).optional(),
    scheduledAt: dateTime({
      format: "dd-MM-yyyy'T'HH:mm:ss'Z'",
    }).optional(),
  },
  hash: enumOf(['comments', 'share']).optional(),
});`

export const editorTypeDeclarations = `
type SearchArrayFormat = 'repeat' | 'comma';
type UnknownSearchBehavior = 'strip' | 'preserve' | 'error';
type InvalidSearchBehavior = 'error' | 'omit';
type BuildDefaults = 'include' | 'omit';
type DateFormatString = string;

interface DateFormatCodec {
  parse(value: string): Date;
  serialize(value: Date): string;
}

interface DateOptions {
  readonly format?:
    | 'date'
    | 'date-time'
    | 'unix-seconds'
    | 'unix-ms'
    | DateFormatString
    | DateFormatCodec;
}

interface DateTimeOptions {
  readonly format?: 'date-time' | DateFormatString | DateFormatCodec;
}

interface RuntimeSchemaBuilder<Value> {
  optional(): RuntimeSchemaBuilder<Value | undefined>;
  required(): RuntimeSchemaBuilder<NonNullable<Value>>;
  default(value: NonNullable<Value>): RuntimeSchemaBuilder<NonNullable<Value>>;
}

interface UrlContract {
  parse(input: string | URL, options?: ParseUrlOptions): unknown;
  safeParse(input: string | URL, options?: ParseUrlOptions): unknown;
  parseRequest(input: Request | { readonly url: string }, options?: ParseRequestOptions): unknown;
  safeParseRequest(input: Request | { readonly url: string }, options?: ParseRequestOptions): unknown;
  normalize(input: unknown, options?: NormalizeUrlOptions): unknown;
  safeNormalize(input: unknown, options?: NormalizeUrlOptions): unknown;
  build(input: unknown, options?: BuildUrlOptions): string;
  match(input: string | URL, options?: ParseUrlOptions): boolean;
  parseSearch(input: string | URLSearchParams, options?: ParseUrlOptions): unknown;
  buildSearch(search: unknown, options?: BuildSearchOptions): string;
  parseHash(input: unknown): unknown;
  buildHash(hash?: unknown, options?: BuildUrlOptions): string;
  withSearch(input: string | URL, search: unknown, options?: PatchSearchOptions): string;
  replaceSearch(input: string | URL, search: unknown, options?: BuildSearchOptions): string;
  omitSearch(input: string | URL, keys: readonly string[], options?: BuildSearchOptions): string;
  pickSearch(input: string | URL, keys: readonly string[], options?: BuildSearchOptions): string;
}

interface ParseUrlOptions {
  readonly unknownSearch?: UnknownSearchBehavior;
  readonly arrayFormat?: SearchArrayFormat;
  readonly invalidSearch?: InvalidSearchBehavior;
}

interface ParseRequestOptions extends ParseUrlOptions {
  readonly baseUrl?: string;
}

interface NormalizeUrlOptions {
  readonly unknownSearch?: UnknownSearchBehavior;
}

interface BuildUrlOptions {
  readonly defaults?: BuildDefaults;
  readonly arrayFormat?: SearchArrayFormat;
}

interface BuildSearchOptions extends BuildUrlOptions {
  readonly sortKeys?: boolean;
}

interface PatchSearchOptions extends BuildSearchOptions {
  readonly removeUndefined?: boolean;
  readonly removeNull?: boolean;
}

declare function url(descriptor: {
  readonly path?: string;
  readonly search?: Record<string, RuntimeSchemaBuilder<unknown>>;
  readonly hash?: RuntimeSchemaBuilder<unknown>;
}): UrlContract;

declare function string(): RuntimeSchemaBuilder<string>;
declare function number(): RuntimeSchemaBuilder<number>;
declare function int(): RuntimeSchemaBuilder<number>;
declare function boolean(): RuntimeSchemaBuilder<boolean>;
declare function date(options?: DateOptions): RuntimeSchemaBuilder<Date>;
declare function dateTime(options?: DateTimeOptions): RuntimeSchemaBuilder<Date>;
declare function array<Value>(schema: RuntimeSchemaBuilder<Value>): RuntimeSchemaBuilder<readonly Value[]>;
declare function enumOf<const Values extends readonly [string, ...string[]]>(
  values: Values,
): RuntimeSchemaBuilder<Values[number]>;
declare function object<Shape extends Record<string, RuntimeSchemaBuilder<unknown>>>(
  shape: Shape,
): RuntimeSchemaBuilder<{ readonly [Key in keyof Shape]: unknown }>;
`

export const articleScenarios: readonly ScenarioConfig[] = [
  {
    label: "Valid full URL",
    kind: "valid",
    value:
      "/articles/42?page=2&tag=ts&tag=urlkit&sort=popular&featured=true&score=9.5&publishedOn=02-06-2026&scheduledAt=02-06-2026T12%3A30%3A05Z#comments",
    description:
      "All declared fields parse successfully, including date and date-time search params.",
  },
  {
    label: "Defaults",
    kind: "valid",
    value: "/articles/42#comments",
    description:
      "Missing defaulted fields are applied by parse() and normalize().",
  },
  {
    label: "Comma tags",
    kind: "option",
    value: "/articles/42?page=2&tag=ts,urlkit&sort=popular#comments",
    description:
      'Uses arrayFormat: "comma" so one query value becomes an array.',
    options: { arrayFormat: "comma" },
  },
  {
    label: "Preserve unknowns",
    kind: "option",
    value: "/articles/42?page=2&utm_source=demo#comments",
    description:
      'Uses unknownSearch: "preserve" to keep undeclared params in unknownSearch.',
    options: { unknownSearch: "preserve" },
  },
  {
    label: "Reject unknowns",
    kind: "option",
    value: "/articles/42?page=2&utm_source=demo#comments",
    description:
      'Uses unknownSearch: "error" so undeclared params make safeParse fail and match false.',
    options: { unknownSearch: "error" },
  },
  {
    label: "Duplicated scalar",
    kind: "invalid",
    value: "/articles/42?page=2&page=3&sort=popular#comments",
    description: "A scalar field cannot receive repeated values.",
  },
  {
    label: "Bad enum",
    kind: "invalid",
    value: "/articles/42?page=2&sort=oldest#comments",
    description:
      "The sort field only accepts the enum values declared in the contract.",
  },
  {
    label: "Bad date",
    kind: "date",
    value: "/articles/42?page=2&publishedOn=2026-06-02#comments",
    description: "The contract expects publishedOn to match dd-MM-yyyy.",
  },
  {
    label: "Bad date-time",
    kind: "date",
    value: "/articles/42?page=2&scheduledAt=02-06-2026%2012%3A30%3A05#comments",
    description:
      "The contract expects scheduledAt to include the literal UTC-looking Z.",
  },
  {
    label: "Bad hash",
    kind: "invalid",
    value: "/articles/42?page=2&sort=popular#other",
    description: "Hash fragments are validated by the same contract.",
  },
]

export const filterExamples: readonly ExampleButtonConfig[] = [
  {
    label: "valid filters",
    value: "/products/42?categories=gadgets&sortBy=priceAsc#grid",
  },
  {
    label: "any pathname",
    value:
      "/anything/here?categories=books&categories=tools&sortBy=recommendation#list",
  },
  {
    label: "unknown search",
    value: "/products?categories=electronics&tab=settings",
  },
  {
    label: "invalid enum",
    value: "/products?categories=electronics&sortBy=cheap",
  },
  {
    label: "invalid hash",
    value: "/products?categories=electronics#table",
  },
]

export const pathlessContractCode = `const ProductFilters = url({
  search: {
    categories: array(string()).optional(),
    sortBy: enumOf(['recommendation', 'desc', 'asc', 'priceDesc', 'priceAsc']).optional(),
  },
  hash: enumOf(['grid', 'list']).optional(),
});`
