import { cn } from "@/lib/utils"

export function Browser({
  title,
  feedback,
  action,
  className,
  children,
}: React.PropsWithChildren<{
  title?: string
  action?: React.ReactNode
  feedback?: React.ReactNode
  className?: string
}>) {
  return (
    <div
      className={cn("overflow-hidden rounded-lg border bg-muted", className)}
    >
      <div className="mx-auto h-full w-full transition-[max-width] duration-200">
        <div className="flex w-full items-center p-3">
          <div className="flex min-h-[24px] w-full items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]"></span>
            <span className="size-2.5 rounded-full bg-[#febc2e]"></span>
            <span className="size-2.5 rounded-full bg-[#28c840]"></span>
            <span className="ml-2 text-sm font-semibold tracking-wide">
              {title}
            </span>
            {feedback}
          </div>
          <div>{action}</div>
        </div>
        <div className="flex h-full w-full rounded-lg border-e-0 bg-background">
          {children}
        </div>
      </div>
    </div>
  )
}
