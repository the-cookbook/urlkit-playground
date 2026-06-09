import * as React from "react"
import type { UnknownSearchBehavior } from "@cookbook/urlkit"
import { capture } from "@/lib/format"
import { Field, Select, Textarea } from "./form-controls"
import { ResultOutput } from "./result-output"
import { ScenarioPills } from "./scenario-pills"

import type {
  ArrayFormat,
  DemoResult,
  InvalidSearchBehavior,
  ParseOptionsState,
  PlaygroundContract,
  ScenarioConfig,
} from "@/contracts"

interface ParsePanelProps {
  readonly contract: PlaygroundContract
  readonly input: string
  readonly options: ParseOptionsState
  readonly scenarios: readonly ScenarioConfig[]
  readonly selectedScenario: string
  readonly scenarioDescription: string
  readonly onInputChange: (value: string) => void
  readonly onOptionsChange: (options: ParseOptionsState) => void
  readonly onScenarioSelect: (scenario: ScenarioConfig) => void
}

export function ParsePanel({
  contract,
  input,
  options,
  scenarios,
  selectedScenario,
  scenarioDescription,
  onInputChange,
  onOptionsChange,
  onScenarioSelect,
}: ParsePanelProps) {
  const results = React.useMemo<readonly DemoResult[]>(
    () => [
      {
        label: "ArticleUrl.safeParse(input, options)",
        value: capture(() => contract.safeParse(input, options)),
      },
      {
        label: "ArticleUrl.match(input, options)",
        value: capture(() => contract.match(input, options)),
      },
      {
        label: "ArticleUrl.parse(input, options)",
        value: capture(() => contract.parse(input, options)),
      },
    ],
    [contract, input, options]
  )

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm lg:p-5">
      <div className="mb-4 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          1. Parse, safeParse, and match
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick a scenario or edit the URL. Options are applied to each method
          call below.
        </p>
      </div>
      <Field label="Serialized URL input" className="mb-4">
        <Textarea
          value={input}
          rows={3}
          onChange={(event) => onInputChange(event.target.value)}
        />
      </Field>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Field
          label="unknownSearch"
          description="Controls undeclared query params."
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
          description="repeat: ?tag=a&tag=b; comma: ?tag=a,b."
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
        <Field
          label="invalidSearch"
          description="Strict errors or omit recoverable invalid fields."
        >
          <Select
            value={options.invalidSearch}
            onChange={(event) =>
              onOptionsChange({
                ...options,
                invalidSearch: event.target.value as InvalidSearchBehavior,
              })
            }
          >
            <option value="error">error</option>
            <option value="omit">omit</option>
          </Select>
        </Field>
      </div>
      <div className="space-y-3">
        <ScenarioPills
          scenarios={scenarios}
          selected={selectedScenario}
          onSelect={onScenarioSelect}
        />
        <p className="mt-5 mb-10 rounded-sm border-l-3 border-foreground/30 bg-muted/50 px-3 py-2 text-sm font-medium text-muted-foreground">
          {scenarioDescription}
        </p>
      </div>
      <h3 className="mt-5 mb-2 text-sm font-semibold">Output</h3>
      <ResultOutput results={results} />
    </section>
  )
}
