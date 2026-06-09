import type { UnknownSearchBehavior } from "@cookbook/urlkit"

import { filterExamples, pathlessContractCode } from "@/data/copies"
import { ProductFilters } from "@/lib/urlkit-runtime"
import { capture } from "@/lib/format"
import { CodeBlock } from "@/components/code-block"
import { Button } from "@/components/ui/button"
import type {
  ArrayFormat,
  DemoResult,
  ExampleButtonConfig,
  ProductHash,
  ProductOptionsState,
  ProductSort,
} from "@/contracts"
import { Field, Input, Select, Textarea } from "./form-controls"
import { ResultOutput } from "./result-output"

interface PathlessPanelProps {
  readonly input: string
  readonly options: ProductOptionsState
  readonly pathname: string
  readonly categories: string
  readonly sortBy: "none" | ProductSort
  readonly hash: "none" | ProductHash
  readonly arrayFormat: ArrayFormat
  readonly onInputChange: (value: string) => void
  readonly onOptionsChange: (options: ProductOptionsState) => void
  readonly onBuildChange: (next: {
    readonly pathname?: string
    readonly categories?: string
    readonly sortBy?: "none" | ProductSort
    readonly hash?: "none" | ProductHash
    readonly arrayFormat?: ArrayFormat
  }) => void
}

export function PathlessPanel({
  input,
  options,
  pathname,
  categories,
  sortBy,
  hash,
  arrayFormat,
  onInputChange,
  onOptionsChange,
  onBuildChange,
}: PathlessPanelProps) {
  const parseResults: readonly DemoResult[] = [
    {
      label: "ProductFilters.safeParse(input, options)",
      value: capture(() => ProductFilters.safeParse(input, options)),
    },
    {
      label: "ProductFilters.match(input, options)",
      value: capture(() => ProductFilters.match(input, options)),
    },
    {
      label: "ProductFilters.parse(input, options)",
      value: capture(() => ProductFilters.parse(input, options)),
    },
    {
      label:
        "ProductFilters.match('/products?categories=electronics&tab=settings', { unknownSearch: 'error' })",
      value: capture(() =>
        ProductFilters.match("/products?categories=electronics&tab=settings", {
          unknownSearch: "error",
        })
      ),
    },
  ]
  const search = {
    categories: splitCsv(categories),
    sortBy: sortBy === "none" ? undefined : sortBy,
  }
  const buildOptions = { arrayFormat }
  const buildResults: readonly DemoResult[] = [
    {
      label: "ProductFilters.build({ search, hash }, options)",
      value: capture(() =>
        ProductFilters.build(
          { search, hash: hash === "none" ? undefined : hash },
          buildOptions
        )
      ),
    },
    {
      label: "ProductFilters.build({ pathname, search, hash }, options)",
      value: capture(() =>
        ProductFilters.build(
          {
            pathname,
            search,
            hash: hash === "none" ? undefined : hash,
          },
          buildOptions
        )
      ),
    },
    {
      label: "ProductFilters.buildSearch(search, options)",
      value: capture(() => ProductFilters.buildSearch(search, buildOptions)),
    },
    {
      label: "ProductFilters.buildHash(hash)",
      value: capture(() =>
        ProductFilters.buildHash(hash === "none" ? undefined : hash)
      ),
    },
  ]

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm lg:p-5">
      <div className="mb-4 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          4. Pathless filters
        </h2>
        <p className="text-sm text-muted-foreground">
          Pathless contracts ignore pathname matching but still validate
          declared search params and hash fragments.
        </p>
      </div>
      <CodeBlock code={pathlessContractCode} />
      <div className="mt-4 space-y-4">
        <Field label="Pathless serialized URL input">
          <Textarea
            value={input}
            rows={3}
            onChange={(event) => onInputChange(event.target.value)}
          />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="unknownSearch"
            description="Use error to reject undeclared filters."
          >
            <Select
              value={options.unknownSearch}
              onChange={(event) =>
                onOptionsChange({
                  ...options,
                  unknownSearch: event.target.value as UnknownSearchBehavior,
                })
              }
            >
              <option value="strip">strip</option>
              <option value="preserve">preserve</option>
              <option value="error">error</option>
            </Select>
          </Field>
          <Field
            label="arrayFormat"
            description="Controls array parsing for categories."
          >
            <Select
              value={options.arrayFormat}
              onChange={(event) =>
                onOptionsChange({
                  ...options,
                  arrayFormat: event.target.value as ArrayFormat,
                })
              }
            >
              <option value="repeat">repeat</option>
              <option value="comma">comma</option>
            </Select>
          </Field>
        </div>
        <ExampleButtons
          examples={filterExamples}
          onSelect={(example) => onInputChange(example.value)}
        />
        <h3 className="text-sm font-semibold">Parse/match output</h3>
        <ResultOutput results={parseResults} />
        <h3 className="text-sm font-semibold">Build pathless hrefs</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Field label="pathname">
            <Input
              value={pathname}
              onChange={(event) =>
                onBuildChange({ pathname: event.target.value })
              }
            />
          </Field>
          <Field label="categories CSV">
            <Input
              value={categories}
              onChange={(event) =>
                onBuildChange({ categories: event.target.value })
              }
            />
          </Field>
          <Field label="sortBy">
            <Select
              value={sortBy}
              onChange={(event) =>
                onBuildChange({
                  sortBy: event.target.value as "none" | ProductSort,
                })
              }
            >
              <option value="none">none</option>
              <option value="recommendation">recommendation</option>
              <option value="desc">desc</option>
              <option value="asc">asc</option>
              <option value="priceDesc">priceDesc</option>
              <option value="priceAsc">priceAsc</option>
            </Select>
          </Field>
          <Field label="hash">
            <Select
              value={hash}
              onChange={(event) =>
                onBuildChange({
                  hash: event.target.value as "none" | ProductHash,
                })
              }
            >
              <option value="none">none</option>
              <option value="grid">grid</option>
              <option value="list">list</option>
            </Select>
          </Field>
          <Field label="arrayFormat">
            <Select
              value={arrayFormat}
              onChange={(event) =>
                onBuildChange({
                  arrayFormat: event.target.value as ArrayFormat,
                })
              }
            >
              <option value="repeat">repeat</option>
              <option value="comma">comma</option>
            </Select>
          </Field>
        </div>
        <ResultOutput results={buildResults} />
      </div>
    </section>
  )
}

function ExampleButtons({
  examples,
  onSelect,
}: {
  readonly examples: readonly ExampleButtonConfig[]
  readonly onSelect: (example: ExampleButtonConfig) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {examples.map((example) => (
        <Button
          key={example.label}
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => onSelect(example)}
        >
          {example.label}
        </Button>
      ))}
    </div>
  )
}

function splitCsv(value: string): readonly string[] | undefined {
  const values = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  return values.length ? values : undefined
}
