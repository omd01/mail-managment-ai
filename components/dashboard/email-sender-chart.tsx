"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { getAnalytics } from "@/lib/analytics-client"

interface EmailSenderData {
  name: string
  value: number
}

export function EmailSenderChart() {
  const [data, setData] = useState<EmailSenderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getAnalytics()
      .then((analyticsData) => {
        if (!active) return
        if (Array.isArray(analyticsData.senderStats) && analyticsData.senderStats.length > 0) {
          setData(analyticsData.senderStats)
        }
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        console.error("Error fetching sender stats data:", err)
        setError("Failed to load sender stats data")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
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
