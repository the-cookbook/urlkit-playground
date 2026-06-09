import type {
  ArrayFormat,
  BuildControlState,
  BuildDefaults,
  BuildOptionsState,
  BuildStateInput,
  DemoResult,
  PlaygroundContract,
} from "@/contracts"
import {
  createBuildStateInput,
  formatBuildFieldDescription,
  formatBuildPlaceholder,
} from "@/lib/build-form"
import { capture } from "@/lib/format"
import { Field, Input, Select, Textarea } from "./form-controls"
import { ResultOutput } from "./result-output"

interface BuildPanelProps {
  readonly contract: PlaygroundContract
  readonly controls: readonly BuildControlState[]
  readonly options: BuildOptionsState
  readonly onControlChange: (control: BuildControlState, value: string) => void
  readonly onOptionsChange: (options: BuildOptionsState) => void
}

export function BuildPanel({
  contract,
  controls,
  options,
  onControlChange,
  onOptionsChange,
}: BuildPanelProps) {
  const input = capture(() => createBuildStateInput(controls))
  const buildInput =
    input instanceof Error ? undefined : (input as BuildStateInput)
  const results: readonly DemoResult[] =
    input instanceof Error || !buildInput
      ? [{ label: "build input", value: input }]
      : [
          {
            label: "build input",
            value: buildInput,
          },
          {
            label: "ArticleUrl.build(input, options)",
            value: capture(() => contract.build(buildInput, options)),
          },
          {
            label: "ArticleUrl.buildSearch(input.search, options)",
            value: capture(() =>
              contract.buildSearch(buildInput.search, options)
            ),
          },
          {
            label: "ArticleUrl.buildHash(input.hash, options)",
            value: capture(() => contract.buildHash(buildInput.hash, options)),
          },
        ]

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm lg:p-5">
      <div className="mb-4 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          2. Build canonical hrefs
        </h2>
        <p className="text-sm text-muted-foreground">
          Build fields are inferred from the active contract after every
          successful edit.
        </p>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Field
          label="defaults"
          description="include serializes provided defaults; omit removes values equal to defaults."
        >
          <Select
            value={options.defaults}
            onChange={(event) =>
              onOptionsChange({
                ...options,
                defaults: event.target.value as BuildDefaults,
              })
            }
          >
            <option value="include">include</option>
            <option value="omit">omit</option>
          </Select>
        </Field>
        <Field
          label="arrayFormat"
          description="Controls how array fields are serialized."
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 xl:grid-cols-4">
        {controls.map((control) => (
          <BuildField
            key={`${control.source}:${control.key}`}
            control={control}
            onChange={(value) => onControlChange(control, value)}
          />
        ))}
      </div>
      <h3 className="mt-5 mb-2 text-sm font-semibold">Output</h3>
      <ResultOutput results={results} />
    </section>
  )
}

interface BuildFieldProps {
  readonly control: BuildControlState
  readonly onChange: (value: string) => void
}

function BuildField({ control, onChange }: BuildFieldProps) {
  const { meta, value } = control
  const description = `${control.source}: ${formatBuildFieldDescription(meta)}`

  return (
    <Field label={control.key} description={description}>
      {meta.kind === "boolean" ? (
        <Select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {createMaybeOmitOptions(control, ["true", "false"]).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      ) : meta.kind === "enum" ? (
        <Select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {createMaybeOmitOptions(control, meta.values ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      ) : meta.kind === "object" ? (
        <Textarea
          value={value}
          rows={4}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          value={value}
          inputMode={
            meta.kind === "number" || meta.kind === "int"
              ? "decimal"
              : undefined
          }
          placeholder={formatBuildPlaceholder(meta)}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  )
}

function createMaybeOmitOptions(
  control: BuildControlState,
  values: readonly string[]
) {
  if (control.source === "hash" || control.meta.optional) {
    return ["omit", ...values]
  }

  return values.length ? values : ["omit"]
}
