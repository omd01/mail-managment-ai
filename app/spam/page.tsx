import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SpamView } from "@/components/ai/spam-view"

export const metadata: Metadata = {
  title: "Spam Detection",
  description: "AI spam detection and classification",
}

export default function SpamPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Spam Detection" text="AI classifier scores every message for spam likelihood." />
      <SpamView />
    </DashboardShell>
  )
}
