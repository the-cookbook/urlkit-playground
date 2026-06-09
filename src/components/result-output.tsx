import * as React from "react"

import { renderResultsAsSource } from "@/lib/format"
import { CodeBlock } from "@/components/code-block"
import type { DemoResult } from "@/contracts"

interface ResultOutputProps {
  readonly results: readonly DemoResult[]
}

export const ResultOutput = React.memo(function ResultOutput({
  results,
}: ResultOutputProps) {
  const source = React.useMemo(() => renderResultsAsSource(results), [results])

  return <CodeBlock code={source} lang="typescript" />
})
