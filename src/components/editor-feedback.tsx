import React from "react"

export function EditorFeedback({
  tone,
  message,
  timeout = 3_000,
}: {
  tone: "error" | "idle" | "success"
  message: React.ReactNode
  timeout?: number
}) {
  const [isVisible, toggleVisibility] = React.useState(true)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    toggleVisibility(true)

    if (tone === "error") return
    if (message === "") {
      toggleVisibility(false)
      return
    }

    const timeoutId = setTimeout(
      () => {
        toggleVisibility(false)
      },

      timeout
    )

    return () => {
      clearTimeout(timeoutId)
    }
  }, [message, tone, timeout])

  if (!isVisible) return null

  return (
    <div
      className={[
        "inline-block rounded-xl px-2 py-0.5 text-xs font-light text-shadow-2xs text-shadow-white dark:text-shadow-black",
        tone === "error"
          ? "bg-destructive/20 font-semibold text-red-900 dark:bg-destructive/40 dark:text-white"
          : tone === "success"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
            : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {message}
    </div>
  )
}
