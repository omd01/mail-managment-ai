import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"

export default function TemplatesLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Templates" text="Loading your email templates..." />

      <div className="flex justify-between mb-6">
        <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Refreshing...</span>
        </Button>

        <Button disabled className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Create New Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
      </div>
    </DashboardShell>
  )
}
