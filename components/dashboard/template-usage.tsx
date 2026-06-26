"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnalytics } from "@/lib/analytics-client"

interface TemplateUsageData {
  name: string
  usage: number
}

export function TemplateUsage() {
  const [data, setData] = useState<TemplateUsageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getAnalytics()
      .then((analyticsData) => {
        if (!active) return
        setData(analyticsData.templateUsage || [])
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        console.error("Error fetching template usage data:", err)
        setError("Failed to load template usage data")
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
