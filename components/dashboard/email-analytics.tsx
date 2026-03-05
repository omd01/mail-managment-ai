"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsData {
  date: string
  sent: number
  delivered: number
  opened: number
}

export function EmailAnalytics() {
  const [data, setData] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use AbortController for cancellable fetch
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        setLoading(true)
        const analyticsData = await fetchAnalyticsData()
        setData(analyticsData.monthlyData || [])
        setError(null)
      } catch (error) {
        // Only set error if not aborted
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error fetching analytics data:", error)
          setError("Failed to load analytics data")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Cleanup function to abort fetch on unmount
    return () => {
      controller.abort()
    }
  }, [])

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

  // Memoize the chart to prevent unnecessary re-renders
  const chart = useMemo(() => {
    if (loading) return <Skeleton className="h-[300px] w-full" />
    if (error) return <div className="flex items-center justify-center h-[300px] text-muted-foreground">{error}</div>

    return (
      <ChartContainer
        config={{
          sent: {
            label: "Sent",
            color: "hsl(var(--chart-1))",
          },
          delivered: {
            label: "Delivered",
            color: "hsl(var(--chart-2))",
          },
          opened: {
            label: "Opened",
            color: "hsl(var(--chart-3))",
          },
        }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="sent"
              stroke="var(--color-sent)"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="delivered"
              stroke="var(--color-delivered)"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="opened"
              stroke="var(--color-opened)"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }, [data, loading, error])

  return (
    <Card className="shadow-md dark:bg-[#0F0F10]">
      <CardHeader className="pb-2">
        <CardTitle>Email Performance</CardTitle>
        <CardDescription>Track your email delivery and open rates over time</CardDescription>
      </CardHeader>
      <CardContent>{chart}</CardContent>
    </Card>
  )
}
