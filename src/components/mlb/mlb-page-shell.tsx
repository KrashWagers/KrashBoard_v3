"use client"

import * as React from "react"
import {
  MlbCard,
  MlbCardContent,
  MlbCardDescription,
  MlbCardHeader,
  MlbCardTitle,
} from "@/components/mlb/mlb-card"

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

const cardVariant = "muted"

export function MlbSectionBlock({ title, description, items }: MlbSectionBlockProps) {
  return (
    <section className="space-y-1.5">
      <div className="space-y-1">
        <h2 className="mlb-section-title text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {items.map((section) => (
          <MlbCard key={section.title} variant={cardVariant}>
            <MlbCardHeader className="p-3 pb-1.5">
              <MlbCardTitle className="text-sm font-semibold tracking-wide">
                {section.title}
              </MlbCardTitle>
              <MlbCardDescription className="text-xs">{section.description}</MlbCardDescription>
            </MlbCardHeader>
            <MlbCardContent className="px-3 pb-3 pt-0 text-[11px] text-muted-foreground">
              Placeholder layout — data and controls will land here.
            </MlbCardContent>
          </MlbCard>
        ))}
      </div>
    </section>
  )
}

export function MlbPageShell({ title, description, sections, children }: MlbPageShellProps) {
  return (
    <div className="space-y-10">
      <MlbCard variant="hero">
        <MlbCardHeader className="p-3">
          <MlbCardTitle className="text-2xl font-semibold tracking-tight">
            {title}
          </MlbCardTitle>
          <MlbCardDescription className="text-sm text-muted-foreground">
            {description}
          </MlbCardDescription>
        </MlbCardHeader>
      </MlbCard>
      {children}
      {sections && sections.length > 0 && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <MlbCard key={section.title} variant={cardVariant}>
              <MlbCardHeader className="p-3 pb-1.5">
                <MlbCardTitle className="text-sm font-semibold tracking-wide">
                  {section.title}
                </MlbCardTitle>
                <MlbCardDescription className="text-xs">{section.description}</MlbCardDescription>
              </MlbCardHeader>
              <MlbCardContent className="px-3 pb-3 pt-0 text-[11px] text-muted-foreground">
                Placeholder layout — data and controls will land here.
              </MlbCardContent>
            </MlbCard>
          ))}
        </div>
      )}
    </div>
  )
}
