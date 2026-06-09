import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"

interface WorkerEnvironment {
  MonacoEnvironment: {
    getWorker(_workerId: string, label: string): Worker
  }
}

let isConfigured = false

export function configureMonacoWorkers() {
  if (isConfigured) {
    return
  }

  ;(self as unknown as WorkerEnvironment).MonacoEnvironment = {
    getWorker(_workerId: string, label: string): Worker {
      if (label === "typescript" || label === "javascript") {
        return new tsWorker() as unknown as Worker
      }

      return new editorWorker() as unknown as Worker
    },
  }

  isConfigured = true
}
