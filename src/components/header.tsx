import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "./ui/separator"

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background py-1 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2" />
        <h1 className="text-base font-semibold">@cookbook/urlkit</h1>
        <nav className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <a
            className="hover:text-foreground"
            href="https://github.com/the-cookbook/urlkit/blob/main/docs/api.md"
            rel="noreferrer"
            target="_blank"
          >
            Docs
          </a>
          <span aria-hidden="true">/</span>
          <a
            className="hover:text-foreground"
            href="https://github.com/the-cookbook/urlkit"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <span aria-hidden="true">/</span>
          <a
            className="hover:text-foreground"
            href="https://www.npmjs.com/package/@cookbook/urlkit"
            rel="noreferrer"
            target="_blank"
          >
            npm
          </a>
        </nav>
      </div>
    </header>
  )
}
