import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { capture } from "@/lib/format"
import type {
  BuildOptionsState,
  DemoResult,
  HelperKeysState,
  HelperTab,
  ParseOptionsState,
  PlaygroundContract,
  PlaygroundContractMeta,
} from "@/contracts"
import { Field, Input } from "./form-controls"
import { ResultOutput } from "./result-output"

interface ParsedHelperKeys {
  readonly omitSearch: readonly string[]
  readonly pickSearch: readonly string[]
}

interface HelpersPanelProps {
  readonly contract: PlaygroundContract
  readonly meta: PlaygroundContractMeta
  readonly input: string
  readonly parseOptions: ParseOptionsState
  readonly buildOptions: BuildOptionsState
  readonly selectedTab: HelperTab
  readonly helperKeys: HelperKeysState
  readonly onTabChange: (tab: HelperTab) => void
  readonly onHelperKeysChange: (keys: HelperKeysState) => void
}

const tabs: readonly { readonly label: string; readonly value: HelperTab }[] = [
  { label: "parseSearch", value: "parseSearch" },
  { label: "withSearch", value: "withSearch" },
  { label: "replaceSearch", value: "replaceSearch" },
  { label: "omitSearch", value: "omitSearch" },
  { label: "pickSearch", value: "pickSearch" },
  { label: "parseHash", value: "parseHash" },
]

export function HelpersPanel({
  contract,
  meta,
  input,
  parseOptions,
  buildOptions,
  selectedTab,
  helperKeys,
  onTabChange,
  onHelperKeysChange,
}: HelpersPanelProps) {
  const patch = React.useMemo(() => createHelperPatch(meta), [meta])
  const omitKeys = React.useMemo(
    () => parseKeyList(helperKeys.omitSearch),
    [helperKeys.omitSearch]
  )
  const pickKeys = React.useMemo(
    () => parseKeyList(helperKeys.pickSearch),
    [helperKeys.pickSearch]
  )
  const helperParsedKeys = React.useMemo(
    () => ({
      omitSearch: omitKeys,
      pickSearch: pickKeys,
    }),
    [omitKeys, pickKeys]
  )
  const result = React.useMemo(
    () =>
      createHelperResult(
        contract,
        selectedTab,
        input,
        parseOptions,
        buildOptions,
        patch,
        helperParsedKeys
      ),
    [
      buildOptions,
      contract,
      helperParsedKeys,
      input,
      parseOptions,
      patch,
      selectedTab,
    ]
  )

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm lg:p-5">
      <div className="mb-4 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          3. URL helper methods
        </h2>
        <p className="text-sm text-muted-foreground">
          The same contract powers focused helpers for search and hash handling.
        </p>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full",
              selectedTab === tab.value &&
                "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <HelperKeyControls
        selectedTab={selectedTab}
        meta={meta}
        helperKeys={helperKeys}
        onHelperKeysChange={onHelperKeysChange}
      />
      <ResultOutput results={[result]} />
    </section>
  )
}

interface HelperKeyControlsProps {
  readonly selectedTab: HelperTab
  readonly meta: PlaygroundContractMeta
  readonly helperKeys: HelperKeysState
  readonly onHelperKeysChange: (keys: HelperKeysState) => void
}

function HelperKeyControls({
  selectedTab,
  meta,
  helperKeys,
  onHelperKeysChange,
}: HelperKeyControlsProps) {
  if (selectedTab !== "omitSearch" && selectedTab !== "pickSearch") {
    return null
  }

  const stateKey = selectedTab
  const value = helperKeys[stateKey]
  const selectedKeys = parseKeyList(value)
  const searchKeys = Object.keys(meta.search)
  const label = selectedTab === "omitSearch" ? "Keys to omit" : "Keys to pick"
  const description = searchKeys.length
    ? `Comma-separated search keys. Available: ${searchKeys.join(", ")}.`
    : "Comma-separated search keys. The active contract does not declare search fields."

  return (
    <div className="mb-4 rounded-xl border bg-muted/30 p-3">
      <Field label={label} description={description}>
        <Input
          value={value}
          placeholder="page, sort"
          onChange={(event) =>
            onHelperKeysChange({
              ...helperKeys,
              [stateKey]: event.target.value,
            })
          }
          readOnly
        />
      </Field>
      {searchKeys.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchKeys.map((key) => {
            const isSelected = selectedKeys.includes(key)

            return (
              <Button
                key={key}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full",
                  isSelected && "border-primary bg-primary/10"
                )}
                onClick={() =>
                  onHelperKeysChange({
                    ...helperKeys,
                    [stateKey]: toggleKey(value, key),
                  })
                }
              >
                {key}
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function createHelperPatch(
  meta: PlaygroundContractMeta
): Record<string, unknown> {
  const patch: Record<string, unknown> = {}

  for (const [key, fieldMeta] of Object.entries(meta.search)) {
    if (
      key === "page" &&
      (fieldMeta.kind === "int" || fieldMeta.kind === "number")
    ) {
      patch[key] = 5
      continue
    }

    if (key === "tag" && fieldMeta.kind === "array") {
      patch[key] = ["patched", "urlkit"]
      continue
    }

    if (key === "sort" && fieldMeta.kind === "enum") {
      patch[key] = fieldMeta.values?.[0] ?? "newest"
      continue
    }

    if (key === "scheduledAt" && fieldMeta.kind === "dateTime") {
      patch[key] = new Date("2026-06-03T09:15:00.000Z")
    }
  }

  return patch
}

function createHelperResult(
  contract: PlaygroundContract,
  tab: HelperTab,
  input: string,
  parseOptions: unknown,
  buildOptions: unknown,
  patch: Record<string, unknown>,
  keys: ParsedHelperKeys
): DemoResult {
  if (tab === "parseSearch") {
    return {
      label: "ArticleUrl.parseSearch(input, parseOptions)",
      value: capture(() => contract.parseSearch(input, parseOptions)),
    }
  }

  if (tab === "withSearch") {
    return {
      label: "ArticleUrl.withSearch(input, patch, buildOptions)",
      value: capture(() => contract.withSearch(input, patch, buildOptions)),
    }
  }

  if (tab === "replaceSearch") {
    return {
      label: "ArticleUrl.replaceSearch(input, patch, buildOptions)",
      value: capture(() => contract.replaceSearch(input, patch, buildOptions)),
    }
  }

  if (tab === "omitSearch") {
    return {
      label: `ArticleUrl.omitSearch(input, ${formatKeys(keys.omitSearch)}, buildOptions)`,
      value: capture(() =>
        contract.omitSearch(input, keys.omitSearch, buildOptions)
      ),
    }
  }

  if (tab === "pickSearch") {
    return {
      label: `ArticleUrl.pickSearch(input, ${formatKeys(keys.pickSearch)}, buildOptions)`,
      value: capture(() =>
        contract.pickSearch(input, keys.pickSearch, buildOptions)
      ),
    }
  }

  return {
    label: "ArticleUrl.parseHash(input)",
    value: capture(() => contract.parseHash(input)),
  }
}

function parseKeyList(value: string): readonly string[] {
  return value
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean)
}

function toggleKey(value: string, key: string): string {
  const keys = parseKeyList(value)

  if (keys.includes(key)) {
    return keys.filter((current) => current !== key).join(", ")
  }

  return [...keys, key].join(", ")
}

function formatKeys(keys: readonly string[]): string {
  return `[${keys.map((key) => `'${key}'`).join(", ")}]`
}
