"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnalytics } from "@/lib/analytics-client"

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

  useEffect(() => {
    let active = true

    getAnalytics()
      .then((analyticsData) => {
        if (!active) return
        setData(analyticsData.monthlyData || [])
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        console.error("Error fetching analytics data:", err)
        setError("Failed to load analytics data")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

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
