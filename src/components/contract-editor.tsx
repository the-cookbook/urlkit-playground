import * as React from "react"
import * as monaco from "monaco-editor"

import { Button } from "@/components/ui/button"
import { Browser } from "@/components/browser"
import { useTheme } from "@/components/theme-provider"
import { configureMonacoWorkers } from "@/lib/monaco-workers"
import { editorTypeDeclarations } from "@/data/copies"
import { RefreshCcw } from "lucide-react"
import { EditorFeedback } from "./editor-feedback"

interface ContractEditorProps {
  readonly value: string
  readonly initialValue: string
  readonly status: {
    readonly message: string
    readonly tone: "idle" | "success" | "error"
  }
  readonly onChange: (value: string) => void
  readonly onReset: () => void
}

const editorModelUri = monaco.Uri.parse("file:///urlkit-playground.ts")

let hasConfiguredTypeScript = false

function configureTypeScriptDefaults() {
  if (hasConfiguredTypeScript) {
    return
  }

  const { typescriptDefaults, ModuleResolutionKind, ModuleKind, ScriptTarget } =
    monaco.typescript

  typescriptDefaults.setCompilerOptions({
    allowNonTsExtensions: true,
    moduleResolution: ModuleResolutionKind.NodeJs,
    module: ModuleKind.ESNext,
    target: ScriptTarget.ES2020,
    strict: true,
    noEmit: true,
  })

  typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  })

  typescriptDefaults.setEagerModelSync(false)
  typescriptDefaults.addExtraLib(
    editorTypeDeclarations,
    "file:///urlkit-playground.d.ts"
  )
  hasConfiguredTypeScript = true
}

export function ContractEditor({
  value,
  initialValue,
  status,
  onChange,
  onReset,
}: ContractEditorProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null)
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  )
  const modelRef = React.useRef<monaco.editor.ITextModel | null>(null)
  const { resolvedTheme } = useTheme()
  const isDirty = value !== initialValue

  React.useEffect(() => {
    configureMonacoWorkers()
    configureTypeScriptDefaults()

    if (!hostRef.current) {
      return
    }

    const existingModel = monaco.editor.getModel(editorModelUri)
    const model =
      existingModel ??
      monaco.editor.createModel(value, "typescript", editorModelUri)

    modelRef.current = model

    const editor = monaco.editor.create(hostRef.current, {
      model,
      minimap: { enabled: false },
      fontSize: 13,
      tabSize: 2,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: "on",
      lineNumbers: "on",
      theme: resolvedTheme === "dark" ? "vs-dark" : "vs",
      padding: { top: 20, bottom: 12 },
      glyphMargin: false,
      folding: false,
      links: false,
      hover: { enabled: false },
      quickSuggestions: false,
      suggestOnTriggerCharacters: false,
      parameterHints: { enabled: false },
      codeLens: false,
      colorDecorators: false,
      selectionHighlight: false,
      renderValidationDecorations: "off",
    })

    editorRef.current = editor

    const subscription = editor.onDidChangeModelContent(() => {
      onChange(editor.getValue())
    })

    requestAnimationFrame(() => {
      editor.layout()
    })

    return () => {
      subscription.dispose()
      editor.dispose()
      model.dispose()
      editorRef.current = null
      modelRef.current = null
    }
    // The editor is intentionally created once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    monaco.editor.setTheme(resolvedTheme === "dark" ? "vs-dark" : "vs")
  }, [resolvedTheme])

  React.useEffect(() => {
    const model = modelRef.current

    if (!model || model.getValue() === value) {
      return
    }

    model.setValue(value)
  }, [value])

  return (
    <section className="col-span-2">
      <Browser
        title="Contract editor"
        action={
          isDirty ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              className="dark:bg-white! dark:text-black"
              onClick={onReset}
            >
              <RefreshCcw />
              Reset
            </Button>
          ) : null
        }
        feedback={
          <EditorFeedback tone={status.tone} message={status.message} />
        }
        className="flex w-full"
      >
        <div className="w-full overflow-hidden">
          <div ref={hostRef} className="h-[390px]" />
        </div>
      </Browser>
    </section>
  )
}
