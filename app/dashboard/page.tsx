import type { Metadata } from "next"
import { Suspense } from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { EmailAnalytics } from "@/components/dashboard/email-analytics"
import { EmailStats } from "@/components/dashboard/email-stats"
import { TemplateUsage } from "@/components/dashboard/template-usage"
import { PricingChart } from "@/components/dashboard/pricing-chart"
import { Skeleton } from "@/components/ui/skeleton"
// Import the new chart components
import { EmailSenderChart } from "@/components/dashboard/email-sender-chart"
import { SesQuotaChart } from "@/components/dashboard/ses-quota-chart"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Email analytics dashboard",
}

// Add dynamic segment to force revalidation on each request
export const dynamic = "force-dynamic"
export const revalidate = 0

// Improved skeleton with less DOM nodes
function StatsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
    </div>
  )
}

function ChartsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Skeleton className="h-[350px]" />
      <Skeleton className="h-[350px]" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="View your email analytics and performance metrics." />
      <div className="space-y-4">
        <Suspense fallback={<StatsSkeleton />}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <EmailStats title="Total Sent" statKey="total" className="bg-blue-50 dark:bg-[#0F0F10]" />
            <EmailStats title="Delivered" statKey="delivered" className="bg-green-50 dark:bg-[#0F0F10]" />
            <EmailStats title="Bounced" statKey="bounced" className="bg-red-50 dark:bg-[#0F0F10]" />
            <EmailStats title="Opened" statKey="opened" className="bg-yellow-50 dark:bg-[#0F0F10]" />
          </div>
        </Suspense>

        <Suspense fallback={<ChartsSkeleton />}>
          <div className="grid gap-3 md:grid-cols-2">
            <EmailAnalytics />
            <TemplateUsage />
          </div>
        </Suspense>

        <Suspense fallback={<ChartsSkeleton />}>
          <div className="grid gap-3 md:grid-cols-2">
            <EmailSenderChart />
            <SesQuotaChart />
          </div>
        </Suspense>

        {/* PricingChart will only render when free quota is exceeded */}
        <Suspense fallback={<Skeleton className="h-[350px]" />}>
          <PricingChart />
        </Suspense>
      </div>
    </DashboardShell>
  )
}
