import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ScenarioConfig } from "@/contracts"

interface ScenarioPillsProps {
  readonly scenarios: readonly ScenarioConfig[]
  readonly selected: string
  readonly onSelect: (scenario: ScenarioConfig) => void
}

const kindClassName = {
  valid:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  invalid:
    "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  option:
    "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  date: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
} as const

export function ScenarioPills({
  scenarios,
  selected,
  onSelect,
}: ScenarioPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {scenarios.map((scenario) => (
        <Button
          key={scenario.label}
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full",
            kindClassName[scenario.kind],
            scenario.label === selected && "ring-2 ring-primary/30"
          )}
          onClick={() => onSelect(scenario)}
        >
          {scenario.label}
        </Button>
      ))}
    </div>
  )
}
