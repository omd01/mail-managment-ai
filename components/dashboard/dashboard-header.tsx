"use client"

import type React from "react"

import { useSession } from "next-auth/react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col gap-1 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
        {session?.user && (
          <p className="text-xs text-muted-foreground">Logged in as {session.user.name || session.user.email}</p>
        )}
      </div>
      {children}
    </div>
  )
}
