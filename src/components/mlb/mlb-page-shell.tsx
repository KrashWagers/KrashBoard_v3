"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type MlbSectionItem = {
  title: string
  description: string
}

type MlbSectionBlockProps = {
  title: string
  description?: string
  items: MlbSectionItem[]
}

type MlbPageShellProps = {
  title: string
  description: string
  sections?: MlbSectionItem[]
  children?: React.ReactNode
}

const cardBase = "rounded-md border border-gray-700 bg-[#171717] shadow-none transition-none"

export function MlbSectionBlock({ title, description, items }: MlbSectionBlockProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((section) => (
          <Card key={section.title} className={cardBase}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription className="text-sm">{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              Placeholder layout — data and controls will land here.
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function MlbPageShell({ title, description, sections, children }: MlbPageShellProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      {sections && sections.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.title} className={cardBase}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription className="text-sm">{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                Placeholder layout — data and controls will land here.
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
