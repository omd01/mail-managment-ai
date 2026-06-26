"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { RefreshCw, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QuotaData {
  max24HourSend?: number
  maxSendRate?: number
  sentLast24Hours?: number
  inSandbox?: boolean
  enabled?: boolean
  error?: string
}

export function SesQuotaChart() {
  const { toast } = useToast()
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuota = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/aws/quota", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch quota data")
      }

      const data = await response.json()
      setQuotaData(data)

      if (data.error) {
        setError(data.error)
      }
    } catch (error) {
      console.error("Error fetching quota data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch quota data")
      toast({
        title: "Error",
        description: "Failed to fetch quota data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuota()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate remaining emails
  const remainingEmails =
    quotaData?.max24HourSend && quotaData?.sentLast24Hours
      ? Math.max(0, quotaData.max24HourSend - quotaData.sentLast24Hours)
      : 0

  // Calculate usage percentage
  const usagePercentage =
    quotaData?.max24HourSend && quotaData?.sentLast24Hours
      ? Math.min(100, (quotaData.sentLast24Hours / quotaData.max24HourSend) * 100)
      : 0

  // Prepare data for pie chart
  const pieData =
    quotaData?.max24HourSend && quotaData?.sentLast24Hours
      ? [
        { name: "Used", value: quotaData.sentLast24Hours },
        { name: "Remaining", value: remainingEmails },
      ]
      : []

  // Colors for the pie chart
  const COLORS = ["#ff7c43", "#4caf50"]

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value.toLocaleString()}`}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].name === "Used" ? "Emails sent in last 24h" : "Emails available to send"}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className="shadow-md dark:bg-[#0F0F10]">
        <CardHeader className="pb-2">
          <CardTitle>SES Sending Quota</CardTitle>
          <CardDescription>Your AWS SES email sending limits and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-md dark:bg-[#0F0F10]">
        <CardHeader className="pb-2">
          <CardTitle>SES Sending Quota</CardTitle>
          <CardDescription>Your AWS SES email sending limits and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={fetchQuota}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md dark:bg-[#0F0F10]">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle>SES Sending Quota</CardTitle>
          <CardDescription>Your AWS SES email sending limits and usage</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchQuota} className="h-8">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-[300px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <Info className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No quota data available</p>
              </div>
            )}
          </div>

          {/* Stats and Progress */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Daily Sending Limit</span>
                <Badge variant={quotaData?.inSandbox ? "outline" : "default"} className="font-normal">
                  {quotaData?.inSandbox === false ? "Production" : "Sandbox"}
                </Badge>
              </div>
              <div className="text-3xl font-bold">{quotaData?.max24HourSend?.toLocaleString() || "N/A"}</div>
              <div className="text-sm text-muted-foreground">Maximum emails per 24 hours</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Usage (Last 24h)</span>
                <span className="text-sm">{usagePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sent: {quotaData?.sentLast24Hours?.toLocaleString() || "0"}</span>
                <span>Remaining: {remainingEmails.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Maximum Sending Rate</span>
              <div className="text-2xl font-bold">{quotaData?.maxSendRate?.toLocaleString() || "N/A"}</div>
              <div className="text-sm text-muted-foreground">Emails per second</div>
            </div>

            {quotaData?.inSandbox && (
              <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your account is in sandbox mode. To increase your sending limits, request production access from AWS.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
