import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { InboxView } from "@/components/ai/inbox-view"

export const metadata: Metadata = {
  title: "Inbox",
  description: "AI-categorized inbox",
}

export default function InboxPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Inbox" text="Messages auto-categorized by the AI classifier." />
      <InboxView />
    </DashboardShell>
  )
}
