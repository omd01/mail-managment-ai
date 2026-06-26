"use client"

// Shared client-side fetcher for /api/analytics. The dashboard renders several
// widgets (stats cards, performance chart, template usage, sender split, cost
// chart) that all need the same payload. This dedupes them into a single
// request and caches the result briefly so they don't each hit the API.

export interface AnalyticsData {
  emailStats: { total: number; delivered: number; bounced: number; opened: number }
  monthlyData: { date: string; sent: number; delivered: number; opened: number }[]
  templateUsage: { name: string; usage: number }[]
  costs: { month: string; cost: number }[]
  senderStats: { name: string; value: number }[]
}

const CACHE_MS = 30_000

let cache: { data: AnalyticsData; time: number } | null = null
let inFlight: Promise<AnalyticsData> | null = null

async function request(): Promise<AnalyticsData> {
  const res = await fetch("/api/analytics", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch analytics data")
  return (await res.json()) as AnalyticsData
}

export async function getAnalytics(force = false): Promise<AnalyticsData> {
  const now = Date.now()
  if (!force && cache && now - cache.time < CACHE_MS) return cache.data
  if (!force && inFlight) return inFlight

  inFlight = request()
    .then((data) => {
      cache = { data, time: Date.now() }
      return data
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}
