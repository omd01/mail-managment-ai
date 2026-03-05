"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface TemplateUsageData {
  name: string
  usage: number
}

// Reuse the shared analytics cache from EmailStats
const analyticsCache: any = null
const lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

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

export function TemplateUsage() {
  const [data, setData] = useState<TemplateUsageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        setLoading(true)
        const analyticsData = await fetchAnalyticsData()
        setData(analyticsData.templateUsage || [])
        setError(null)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error fetching template usage data:", error)
          setError("Failed to load template usage data")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      controller.abort()
    }
  }, [])

  // Memoize the chart to prevent unnecessary re-renders
  const chart = useMemo(() => {
    if (loading) return <Skeleton className="h-[300px] w-full" />
    if (error) return <div className="flex items-center justify-center h-[300px] text-muted-foreground">{error}</div>

    // If no data, show a message
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No template usage data available
        </div>
      )
    }

    return (
      <ChartContainer
        config={{
          usage: {
            label: "Usage",
            color: "hsl(var(--chart-4))",
          },
        }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="usage" fill="var(--color-usage)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }, [data, loading, error])

  return (
    <Card className="shadow-md dark:bg-[#0F0F10]">
      <CardHeader className="pb-2">
        <CardTitle>Template Usage</CardTitle>
        <CardDescription>Most frequently used email templates</CardDescription>
      </CardHeader>
      <CardContent>{chart}</CardContent>
    </Card>
  )
}
