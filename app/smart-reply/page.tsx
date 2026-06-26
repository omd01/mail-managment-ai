import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SmartReply } from "@/components/ai/smart-reply"

export const metadata: Metadata = {
  title: "Smart Reply",
  description: "AI-generated auto-responses",
}

export default function SmartReplyPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Smart Reply" text="Generate context-aware auto-responses to incoming messages." />
      <SmartReply />
    </DashboardShell>
  )
}
