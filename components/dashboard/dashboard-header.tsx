"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.name || session.user.email)
    } else {
      fetch("/api/user/profile")
        .then((res) => {
          if (res.ok) return res.json()
        })
        .then((data) => {
          if (data?.email) {
            setEmail(data.name || data.email)
          }
        })
        .catch(() => {})
    }
  }, [session])

  return (
    <div className="flex flex-col gap-1 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
        {email && (
          <p className="text-xs text-muted-foreground">Logged in as {email}</p>
        )}
      </div>
      {children}
    </div>
  )
}
