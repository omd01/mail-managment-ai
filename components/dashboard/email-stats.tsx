"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnalytics } from "@/lib/analytics-client"

interface EmailStatsProps {
  title: string
  statKey: "total" | "delivered" | "bounced" | "opened"
  description?: string
  className?: string
}

export function EmailStats({ title, statKey, description, className }: EmailStatsProps) {
  const [value, setValue] = useState<string>("0")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statsDescription, setStatsDescription] = useState(description || "")

  const describe = (stats: { total: number; delivered: number; bounced: number; opened: number }) => {
    if (description) return
    if (statKey === "delivered" && stats.total > 0) {
      setStatsDescription(`${((stats.delivered / stats.total) * 100).toFixed(1)}% delivery rate`)
    } else if (statKey === "bounced" && stats.total > 0) {
      setStatsDescription(`${((stats.bounced / stats.total) * 100).toFixed(1)}% bounce rate`)
    } else if (statKey === "opened" && stats.delivered > 0) {
      setStatsDescription(`${((stats.opened / stats.delivered) * 100).toFixed(1)}% open rate`)
    } else {
      setStatsDescription("Total emails sent")
    }
  }

  useEffect(() => {
    let active = true

    getAnalytics()
      .then((analyticsData) => {
        if (!active) return
        const stats = analyticsData.emailStats
        if (stats && stats[statKey] !== undefined) {
          setValue(stats[statKey].toLocaleString())
          describe(stats)
        }
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        console.error(`Error fetching ${statKey} stat:`, err)
        setError(`Failed to load`)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statKey])

  if (loading) {
    return (
      <Card className={cn("shadow-md", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("shadow-md", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{statsDescription}</p>
      </CardContent>
    </Card>
  )
}
