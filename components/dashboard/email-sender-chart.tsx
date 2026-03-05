"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface EmailSenderData {
  name: string
  value: number
}

export function EmailSenderChart() {
  const [data, setData] = useState<EmailSenderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  /*
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        setLoading(true)
        const analyticsData = await fetchAnalyticsData()

        if (analyticsData.senderStats && Array.isArray(analyticsData.senderStats)) {
          setData(analyticsData.senderStats)
        } else {
          // Fallback data if not available yet
          setData([
            { name: "noreply@linksus.in", value: 45 },
            { name: "support@linksus.in", value: 30 },
            { name: "info@linksus.in", value: 25 },
          ])
        }

        setError(null)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error fetching sender stats data:", error)
          setError("Failed to load sender stats data")
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
  */

  // Auto-fetch disabled
  useEffect(() => {
    setLoading(false)
    // Set dummy data so it doesn't look broken
    setData([
      { name: "noreply@linksus.in", value: 45 },
      { name: "support@linksus.in", value: 30 },
      { name: "info@linksus.in", value: 25 },
    ])
  }, [])

  // Define bright, high-contrast colors that will be visible in dark mode
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <Card className="shadow-md dark:bg-[#0F0F10]">
      <CardHeader className="pb-2">
        <CardTitle>Email Senders</CardTitle>
        <CardDescription>Distribution of emails sent by sender address</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">{error}</div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No sender data available
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name.split("@")[0]}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#000"
                      className="dark:stroke-gray-800"
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => value.split("@")[0]}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ color: "var(--foreground)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
