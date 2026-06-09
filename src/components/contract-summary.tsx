import type { PlaygroundContractMeta } from "@/contracts"
import {
  formatFieldSummary,
  formatParamSummary,
  formatSearchSummary,
} from "@/lib/format"

interface ContractSummaryProps {
  readonly meta: PlaygroundContractMeta
}

export function ContractSummary({ meta }: ContractSummaryProps) {
  const items = [
    ["Path", meta.path ?? "pathless"],
    ["Params", formatParamSummary(meta.params)],
    ["Search", formatSearchSummary(meta.search)],
    ["Hash", formatFieldSummary(meta.hash)],
  ] as const

  return (
    <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 xl:mt-0 xl:grid-cols-1 xl:px-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0 rounded-xl border bg-muted/40 p-3">
          <div className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </div>
          <code className="block bg-transparent p-0 font-mono text-xs font-semibold text-foreground">
            {value}
          </code>
        </div>
      ))}
    </section>
  )
}
