import {
  array,
  boolean as booleanField,
  date,
  dateTime,
  enumOf,
  int,
  number as numberField,
  object,
  string,
  url,
} from "@cookbook/urlkit"
import { tokenize } from "@cookbook/pathkit"

import type {
  AppliedArticleContract,
  FieldKind,
  PlaygroundContract,
  PlaygroundContractMeta,
  PlaygroundFieldMeta,
  PlaygroundParamMeta,
  RuntimeSchemaBuilderLike,
  RuntimeUrlDescriptorLike,
  SchemaWithMeta,
} from "@/contracts"
import { schemaMetaSymbol } from "@/contracts"

const runtimeSchemaBuilderSymbol: unique symbol = Symbol(
  "urlkit.playground.runtimeSchemaBuilder"
)

function createBaseFieldMeta(kind: FieldKind): PlaygroundFieldMeta {
  return {
    kind,
    optional: false,
    hasDefault: false,
  }
}

function wrapSchemaBuilder(
  builder: RuntimeSchemaBuilderLike,
  meta: PlaygroundFieldMeta
): RuntimeSchemaBuilderLike & SchemaWithMeta {
  const proxyTarget = Object.create(null) as RuntimeSchemaBuilderLike &
    SchemaWithMeta

  return new Proxy(proxyTarget, {
    get(_target, property, receiver) {
      if (property === schemaMetaSymbol) {
        return meta
      }

      if (property === runtimeSchemaBuilderSymbol) {
        return builder
      }

      if (property === "optional") {
        return () =>
          wrapSchemaBuilder(builder.optional(), {
            ...meta,
            optional: true,
          })
      }

      if (property === "required") {
        return () =>
          wrapSchemaBuilder(builder.required(), {
            ...meta,
            optional: false,
          })
      }

      if (property === "default") {
        return (value: unknown) =>
          wrapSchemaBuilder(builder.default(value), {
            ...meta,
            optional: false,
            hasDefault: true,
            defaultValue: value,
          })
      }

      const value = Reflect.get(builder as object, property, receiver)

      return typeof value === "function" ? value.bind(builder) : value
    },

    has(_target, property) {
      return (
        property === schemaMetaSymbol ||
        property === runtimeSchemaBuilderSymbol ||
        property in (builder as object)
      )
    },
  })
}

function unwrapSchemaBuilder(
  schema: RuntimeSchemaBuilderLike
): RuntimeSchemaBuilderLike {
  if (!schema || (typeof schema !== "object" && typeof schema !== "function")) {
    return schema
  }

  return (
    (
      schema as {
        readonly [runtimeSchemaBuilderSymbol]?: RuntimeSchemaBuilderLike
      }
    )[runtimeSchemaBuilderSymbol] ?? schema
  )
}

function unwrapSearchSchema(
  search: RuntimeUrlDescriptorLike["search"]
): RuntimeUrlDescriptorLike["search"] {
  if (!search) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(search).map(([key, schema]) => [
      key,
      unwrapSchemaBuilder(schema),
    ])
  )
}

function unwrapObjectShape(
  shape: Readonly<Record<string, RuntimeSchemaBuilderLike>>
): Readonly<Record<string, RuntimeSchemaBuilderLike>> {
  return Object.fromEntries(
    Object.entries(shape).map(([key, schema]) => [
      key,
      unwrapSchemaBuilder(schema),
    ])
  )
}

function unwrapUrlDescriptor(
  descriptor: RuntimeUrlDescriptorLike
): RuntimeUrlDescriptorLike {
  return {
    ...(descriptor.path ? { path: descriptor.path } : {}),
    ...(descriptor.search
      ? { search: unwrapSearchSchema(descriptor.search) }
      : {}),
    ...(descriptor.hash ? { hash: unwrapSchemaBuilder(descriptor.hash) } : {}),
  }
}

function getSchemaMeta(schema: unknown): PlaygroundFieldMeta | undefined {
  if (!schema || (typeof schema !== "object" && typeof schema !== "function")) {
    return undefined
  }

  return (schema as { readonly [schemaMetaSymbol]?: PlaygroundFieldMeta })[
    schemaMetaSymbol
  ]
}

function stringWithMeta(): SchemaWithMeta {
  return wrapSchemaBuilder(
    string() as never,
    createBaseFieldMeta("string")
  ) as SchemaWithMeta
}

function numberWithMeta(): SchemaWithMeta {
  return wrapSchemaBuilder(
    numberField() as never,
    createBaseFieldMeta("number")
  ) as SchemaWithMeta
}

function intWithMeta(): SchemaWithMeta {
  return wrapSchemaBuilder(
    int() as never,
    createBaseFieldMeta("int")
  ) as SchemaWithMeta
}

function booleanWithMeta(): SchemaWithMeta {
  return wrapSchemaBuilder(
    booleanField() as never,
    createBaseFieldMeta("boolean")
  ) as SchemaWithMeta
}

function dateWithMeta(options?: unknown): SchemaWithMeta {
  return wrapSchemaBuilder(date(options as never) as never, {
    ...createBaseFieldMeta("date"),
    format: readFormatOption(options),
  }) as SchemaWithMeta
}

function dateTimeWithMeta(options?: unknown): SchemaWithMeta {
  return wrapSchemaBuilder(dateTime(options as never) as never, {
    ...createBaseFieldMeta("dateTime"),
    format: readFormatOption(options),
  }) as SchemaWithMeta
}

function arrayWithMeta(schema: RuntimeSchemaBuilderLike): SchemaWithMeta {
  const item = getSchemaMeta(schema) ?? createBaseFieldMeta("string")

  return wrapSchemaBuilder(
    array(unwrapSchemaBuilder(schema) as never) as never,
    {
      kind: "array",
      optional: false,
      hasDefault: false,
      item,
    }
  ) as SchemaWithMeta
}

function enumOfWithMeta(values: readonly string[]): SchemaWithMeta {
  return wrapSchemaBuilder(enumOf(values as never) as never, {
    kind: "enum",
    optional: false,
    hasDefault: false,
    values,
  }) as SchemaWithMeta
}

function objectWithMeta(
  shape: Readonly<Record<string, RuntimeSchemaBuilderLike>>
): SchemaWithMeta {
  return wrapSchemaBuilder(object(unwrapObjectShape(shape) as never) as never, {
    kind: "object",
    optional: false,
    hasDefault: false,
    shape: Object.fromEntries(
      Object.entries(shape).map(([key, schema]) => [
        key,
        getSchemaMeta(schema) ?? createBaseFieldMeta("string"),
      ])
    ),
  }) as SchemaWithMeta
}

function readFormatOption(options: unknown): unknown {
  if (!options || typeof options !== "object") {
    return undefined
  }

  return (options as { readonly format?: unknown }).format
}

function createContractMeta(
  descriptor: RuntimeUrlDescriptorLike
): PlaygroundContractMeta {
  return {
    path: descriptor.path,
    params: descriptor.path ? parsePathParamMeta(descriptor.path) : [],
    search: Object.fromEntries(
      Object.entries(descriptor.search ?? {}).map(([key, schema]) => [
        key,
        getSchemaMeta(schema) ?? createBaseFieldMeta("string"),
      ])
    ),
    hash: descriptor.hash ? getSchemaMeta(descriptor.hash) : undefined,
  }
}

function parsePathParamMeta(path: string): readonly PlaygroundParamMeta[] {
  const params: PlaygroundParamMeta[] = []
  const tokens = tokenize(path)

  const paramSeguiments = tokens.filter(
    (segment) => segment.type === "parameter"
  )

  for (const param of paramSeguiments) {
    const { name, optional, constraints } = param

    const isNumber = constraints.some((constraint) =>
      ["int", "decimal", "min", "max", "range"].includes(constraint.type)
    )

    params.push({
      name,
      optional,
      kind: isNumber ? "number" : "string",
    })
  }

  return params
}

export function createArticleContract(code: string): AppliedArticleContract {
  let meta: PlaygroundContractMeta | undefined
  const urlWithMeta = (
    descriptor: RuntimeUrlDescriptorLike
  ): PlaygroundContract => {
    meta = createContractMeta(descriptor)
    return url(unwrapUrlDescriptor(descriptor) as never) as PlaygroundContract
  }

  const factory = new Function(
    "url",
    "string",
    "number",
    "int",
    "boolean",
    "date",
    "dateTime",
    "array",
    "enumOf",
    "object",
    `"use strict";
${code}
if (typeof ArticleUrl === 'undefined') {
  throw new Error('Define a contract named ArticleUrl.');
}
return ArticleUrl;`
  )

  const created = factory(
    urlWithMeta,
    stringWithMeta,
    numberWithMeta,
    intWithMeta,
    booleanWithMeta,
    dateWithMeta,
    dateTimeWithMeta,
    arrayWithMeta,
    enumOfWithMeta,
    objectWithMeta
  )

  if (
    !created ||
    typeof created.parse !== "function" ||
    typeof created.build !== "function"
  ) {
    throw new Error("ArticleUrl must be created with url(...).")
  }

  return {
    contract: created as PlaygroundContract,
    meta: meta ?? { params: [], search: {} },
  }
}

export const ProductFilters = url({
  search: {
    categories: array(string()).optional(),
    sortBy: enumOf([
      "recommendation",
      "desc",
      "asc",
      "priceDesc",
      "priceAsc",
    ]).optional(),
  },
  hash: enumOf(["grid", "list"]).optional(),
})
