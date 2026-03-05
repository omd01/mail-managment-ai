import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function BulkLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Bulk Email" text="Loading bulk email form..." />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-32" />

          <div className="mt-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
