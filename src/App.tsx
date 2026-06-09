import React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { DocsSidebar } from "@/components/docs-sidebar"
import { ContractEditor } from "@/components/contract-editor"
import { ContractSummary } from "@/components/contract-summary"
import { ParsePanel } from "@/components/parse-panel"
import { BuildPanel } from "@/components/build-panel"
import { HelpersPanel } from "@/components/helpers-panel"
import { PathlessPanel } from "@/components/pathless-panel"
import { createBuildControls, updateBuildControl } from "@/lib/build-form"
import { createArticleContract } from "@/lib/urlkit-runtime"
import { formatErrorMessage } from "@/lib/format"
import { articleScenarios, initialContractCode } from "@/data/copies"
import type {
  BuildOptionsState,
  ParseOptionsState,
  HelperTab,
  HelperKeysState,
  ProductHash,
  ProductOptionsState,
  ProductSort,
} from "@/contracts"

const autoApplyDelayMs = 650

export function App() {
  const [contractCode, setContractCode] = React.useState(initialContractCode)
  const [appliedArticle, setAppliedArticle] = React.useState(() =>
    createArticleContract(initialContractCode)
  )
  const [status, setStatus] = React.useState({
    message: "Contract ready. Edit the code to auto-apply changes.",
    tone: "idle" as "idle" | "success" | "error",
  })
  const [lastAppliedContractCode, setLastAppliedContractCode] =
    React.useState(initialContractCode)
  const [buildControls, setBuildControls] = React.useState(() =>
    createBuildControls(appliedArticle.meta)
  )
  const [articleInput, setArticleInput] = React.useState(
    articleScenarios[0]?.value ?? ""
  )
  const [selectedScenario, setSelectedScenario] = React.useState(
    articleScenarios[0]?.label ?? ""
  )
  const [scenarioDescription, setScenarioDescription] = React.useState(
    articleScenarios[0]?.description ?? ""
  )
  const [parseOptions, setParseOptions] = React.useState<ParseOptionsState>({
    unknownSearch: "strip",
    arrayFormat: "repeat",
    invalidSearch: "error",
  })
  const [buildOptions, setBuildOptions] = React.useState<BuildOptionsState>({
    defaults: "include",
    arrayFormat: "repeat",
  })
  const [selectedHelperTab, setSelectedHelperTab] =
    React.useState<HelperTab>("parseSearch")
  const [helperKeys, setHelperKeys] = React.useState<HelperKeysState>({
    omitSearch: "tag",
    pickSearch: "page, sort",
  })
  const [productInput, setProductInput] = React.useState(
    "/products/42?categories=gadgets&sortBy=priceAsc#grid"
  )
  const [productOptions, setProductOptions] =
    React.useState<ProductOptionsState>({
      unknownSearch: "strip",
      arrayFormat: "repeat",
    })
  const [pathlessBuild, setPathlessBuild] = React.useState({
    pathname: "/products",
    categories: "books, tools",
    sortBy: "recommendation" as "none" | ProductSort,
    hash: "grid" as "none" | ProductHash,
    arrayFormat: "repeat" as "repeat" | "comma",
  })

  React.useEffect(() => {
    if (contractCode === lastAppliedContractCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus({
        message: "",
        tone: "idle",
      })

      return
    }

    setStatus({
      message: "editing...",
      tone: "idle",
    })

    const timeoutId = window.setTimeout(() => {
      try {
        const next = createArticleContract(contractCode)
        setAppliedArticle(next)
        setBuildControls(createBuildControls(next.meta))
        setLastAppliedContractCode(contractCode)
        setStatus({
          message: "updated",
          tone: "success",
        })
      } catch (error) {
        setStatus({
          message: `Error: ${formatErrorMessage(error)}`,
          tone: "error",
        })
      }
    }, autoApplyDelayMs)

    return () => window.clearTimeout(timeoutId)
  }, [contractCode, lastAppliedContractCode])

  return (
    <>
      <SidebarProvider>
        <DocsSidebar />
        <SidebarInset>
          <Header />
          <main className="space-y-10 p-4 lg:p-5">
            <Hero />
            <div className="mb-4 space-y-2">
              <h2 className="text-base font-normal">
                Edit{" "}
                <code className="rounded-sm bg-indigo-400/10 px-1.5 py-0.5 text-sm font-semibold dark:bg-indigo-400/40">
                  ArticleUrl
                </code>{" "}
                directly. Helpers like{" "}
                <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">
                  url
                </code>
                ,{" "}
                <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">
                  int
                </code>
                ,{" "}
                <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">
                  array
                </code>
                ,{" "}
                <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">
                  enumOf
                </code>
                ,{" "}
                <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">
                  date
                </code>
                , and{" "}
                <code className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">
                  dateTime
                </code>{" "}
                are already in scope.
              </h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3">
              <ContractEditor
                value={contractCode}
                initialValue={initialContractCode}
                status={status}
                onChange={setContractCode}
                onReset={() => {
                  setContractCode(initialContractCode)
                  const next = createArticleContract(initialContractCode)
                  setAppliedArticle(next)
                  setBuildControls(createBuildControls(next.meta))
                  setLastAppliedContractCode(initialContractCode)
                  setStatus({
                    message: "Contract reset to the default example.",
                    tone: "idle",
                  })
                }}
              />

              <ContractSummary meta={appliedArticle.meta} />
            </div>
            <Separator />
            <ParsePanel
              contract={appliedArticle.contract}
              input={articleInput}
              options={parseOptions}
              scenarios={articleScenarios}
              selectedScenario={selectedScenario}
              scenarioDescription={scenarioDescription}
              onInputChange={setArticleInput}
              onOptionsChange={setParseOptions}
              onScenarioSelect={(scenario) => {
                setSelectedScenario(scenario.label)
                setArticleInput(scenario.value)
                setScenarioDescription(scenario.description)
                setParseOptions((current) => ({
                  ...current,
                  ...scenario.options,
                }))
              }}
            />

            <BuildPanel
              contract={appliedArticle.contract}
              controls={buildControls}
              options={buildOptions}
              onControlChange={(control, value) =>
                setBuildControls((current) =>
                  updateBuildControl(
                    current,
                    control.source,
                    control.key,
                    value
                  )
                )
              }
              onOptionsChange={setBuildOptions}
            />
            <HelpersPanel
              contract={appliedArticle.contract}
              meta={appliedArticle.meta}
              input={articleInput}
              parseOptions={parseOptions}
              buildOptions={buildOptions}
              selectedTab={selectedHelperTab}
              helperKeys={helperKeys}
              onTabChange={setSelectedHelperTab}
              onHelperKeysChange={setHelperKeys}
            />
            <PathlessPanel
              input={productInput}
              options={productOptions}
              pathname={pathlessBuild.pathname}
              categories={pathlessBuild.categories}
              sortBy={pathlessBuild.sortBy}
              hash={pathlessBuild.hash}
              arrayFormat={pathlessBuild.arrayFormat}
              onInputChange={setProductInput}
              onOptionsChange={setProductOptions}
              onBuildChange={(next) =>
                setPathlessBuild((current) => ({ ...current, ...next }))
              }
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}

export default App
