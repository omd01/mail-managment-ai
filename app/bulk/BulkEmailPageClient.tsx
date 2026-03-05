"use client"

import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BulkEmailForm } from "@/components/bulk/bulk-email-form"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Loading fallback component
function BulkEmailFormSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  )
}

export default function BulkEmailPageClient() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Bulk Email"
        text="Send emails to multiple recipients at once. Use templates or create custom emails."
      />
      <Suspense fallback={<BulkEmailFormSkeleton />}>
        <BulkEmailForm />
      </Suspense>
    </DashboardShell>
  )
}
