"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface EmailStatsProps {
  title: string
  statKey: "total" | "delivered" | "bounced" | "opened"
  description?: string
  className?: string
}

// Create a shared analytics data cache
// let analyticsCache: any = null
// let lastFetchTime = 0
// const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Shared fetch function to avoid duplicate requests
async function fetchAnalyticsData() {
  // Force fresh data on each request
  const response = await fetch("/api/analytics", {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch analytics data")
  }

  return await response.json()
}

export function EmailStats({ title, statKey, description, className }: EmailStatsProps) {
  const [value, setValue] = useState<string>("0")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statsDescription, setStatsDescription] = useState(description || "")

  const setStat = (newValue: number) => {
    setValue(newValue.toLocaleString())

    if (!description) {
      // Fetch latest total to calculate percentages
      fetchAnalyticsData().then((analyticsData) => {
        if (analyticsData.emailStats) {
          const stats = analyticsData.emailStats
          if (statKey === "delivered" && stats.total > 0) {
            const percentage = ((stats.delivered / stats.total) * 100).toFixed(1)
            setStatsDescription(`${percentage}% delivery rate`)
          } else if (statKey === "bounced" && stats.total > 0) {
            const percentage = ((stats.bounced / stats.total) * 100).toFixed(1)
            setStatsDescription(`${percentage}% bounce rate`)
          } else if (statKey === "opened" && stats.delivered > 0) {
            const percentage = ((stats.opened / stats.delivered) * 100).toFixed(1)
            setStatsDescription(`${percentage}% open rate`)
          } else {
            setStatsDescription("Total emails sent")
          }
        }
      })
    }
  }

  /*
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        setLoading(true)
        const analyticsData = await fetchAnalyticsData()

        if (analyticsData.emailStats && analyticsData.emailStats[statKey] !== undefined) {
          setStat(analyticsData.emailStats[statKey])
        } else {
          setStat(0)
        }

        setError(null)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error(`Error fetching ${statKey} stat:`, error)
          setError(`Failed to load ${statKey} data`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchData, 30000)

    return () => {
      controller.abort()
      clearInterval(intervalId)
    }
  }, [statKey])
  */

  // Auto-fetch disabled
  useEffect(() => {
    setLoading(false)
  }, [])

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
