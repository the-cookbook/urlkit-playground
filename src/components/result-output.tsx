import { renderResultsAsSource } from "@/lib/format"
import { CodeBlock } from "@/components/code-block"
import type { DemoResult } from "@/contracts"

interface ResultOutputProps {
  readonly results: readonly DemoResult[]
}

export function ResultOutput({ results }: ResultOutputProps) {
  return <CodeBlock code={renderResultsAsSource(results)} lang="typescript" />
}
