import type * as React from "react"

interface FieldProps {
  readonly label: string
  readonly description?: string
  readonly children: React.ReactNode
  readonly className?: string
}

export function Field({
  label,
  description,
  children,
  className = "",
}: FieldProps) {
  return (
    <label className={`grid gap-2 text-sm font-medium ${className}`}>
      <span>{label}</span>
      {description ? (
        <span className="text-xs font-normal text-muted-foreground">
          {description}
        </span>
      ) : null}
      {children}
    </label>
  )
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`min-h-24 w-full resize-y rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${props.className ?? ""}`}
    />
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${props.className ?? ""}`}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${props.className ?? ""}`}
    />
  )
}
