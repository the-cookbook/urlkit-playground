import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { docsSections } from "@/data/copies"
import { CodeBlock } from "@/components/code-block"

export function DocsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="mb-2 flex flex-row items-center gap-0.5 leading-none text-muted-foreground">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Docs
              </span>
            </div>
            <div className="mb-5 space-y-2">
              <h2 className="text-lg font-semibold">URLKit reference</h2>
              <p className="text-sm text-muted-foreground">
                Helpers and methods available in the editable contract and
                playground.
              </p>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {docsSections.map((section) => (
          <React.Fragment key={section.title}>
            <SidebarGroup className="mb-0">
              <SidebarMenu>
                <SidebarMenuItem key={section.title}>
                  <div>
                    <summary className="text-sm font-semibold select-none">
                      {section.title}
                    </summary>
                    {section.description ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <div className="mt-3 mb-5 space-y-2">
                      {section.items.map((item) => (
                        <Accordion
                          key={item.name}
                          type="multiple"
                          className="rounded-md"
                        >
                          <AccordionItem
                            value={item.name}
                            className="bg-background!"
                          >
                            <AccordionTrigger className="p-2 font-mono">
                              {item.name}
                            </AccordionTrigger>
                            <AccordionContent>
                              {item.signature !== undefined && (
                                <CodeBlock code={item.signature} />
                              )}
                              <p>{item.description}</p>
                              {item.details?.length ? (
                                <ul className="list-disc space-y-1 pl-4">
                                  {item.details.map((detail) => (
                                    <li key={detail}>{detail}</li>
                                  ))}
                                </ul>
                              ) : null}
                              {Boolean(item.example) && (
                                <>
                                  <span className="text-xs">Example:</span>
                                  <code className="mb-2 block rounded-xs bg-muted p-2 text-[11px] whitespace-pre-wrap text-foreground">
                                    {item.example}
                                  </code>
                                </>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator className="mt-2 mb-5 w-auto" />
          </React.Fragment>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
