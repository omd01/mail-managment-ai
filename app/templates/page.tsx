import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TemplateGrid } from "@/components/templates/template-grid"

export const metadata: Metadata = {
  title: "Templates",
  description: "Manage your email templates",
}

// Add dynamic segment to force revalidation on each request
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function TemplatesPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Templates" text="Create and manage your email templates." />
      <TemplateGrid />
    </DashboardShell>
  )
}
