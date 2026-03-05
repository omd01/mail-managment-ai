"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Info } from "lucide-react"

interface CostData {
  month: string
  cost: number
}

// AWS SES free tier limit (62,000 emails per month)
const FREE_TIER_LIMIT = 62000

// Reuse the shared analytics cache from EmailStats
let analyticsCache: any = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

async function fetchAnalyticsData() {
  const now = Date.now()

  if (analyticsCache && now - lastFetchTime < CACHE_DURATION) {
    return analyticsCache
  }

  const response = await fetch("/api/analytics", {
    cache: "force-cache",
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch analytics data")
  }

  const data = await response.json()
  analyticsCache = data
  lastFetchTime = now

  return data
}

export function PricingChart() {
  const [data, setData] = useState<CostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalSent, setTotalSent] = useState(0)
  const [freeQuotaExceeded, setFreeQuotaExceeded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        setLoading(true)
        const analyticsData = await fetchAnalyticsData()

        // Set cost data
        setData(analyticsData.costs || [])

        // Check if total emails sent exceeds free tier
        if (analyticsData.emailStats && analyticsData.emailStats.total) {
          const total = analyticsData.emailStats.total
          setTotalSent(total)
          setFreeQuotaExceeded(total > FREE_TIER_LIMIT)
        }

        setError(null)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error fetching cost data:", error)
          setError("Failed to load cost data")
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

    return (
      <ChartContainer
        config={{
          cost: {
            label: "Cost ($)",
            color: "hsl(var(--chart-5))",
          },
        }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="var(--color-cost)"
              fill="var(--color-cost)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }, [data, loading, error])

  // If free quota is not exceeded, don't render the component
  if (!freeQuotaExceeded && !loading) {
    return null
  }

  return (
    <Card className="shadow-md dark:bg-[#0F0F10]">
      <CardHeader className="pb-2">
        <CardTitle>Email Costs</CardTitle>
        <CardDescription>Monthly email sending costs</CardDescription>
      </CardHeader>
      <CardContent>
        {chart}
        {freeQuotaExceeded && (
          <div className="mt-4 text-sm flex items-start gap-2 text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              You've sent {totalSent.toLocaleString()} emails, exceeding the AWS SES free tier limit of{" "}
              {FREE_TIER_LIMIT.toLocaleString()} emails per month. Additional emails are charged at $0.10 per 1,000
              emails.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
