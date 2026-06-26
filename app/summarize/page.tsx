import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Summarizer } from "@/components/ai/summarizer"

export const metadata: Metadata = {
  title: "AI Summarization",
  description: "Summarize long email threads with AI",
}

export default function SummarizePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="AI Summarization" text="Condense long email threads into key points and action items." />
      <Summarizer />
    </DashboardShell>
  )
}
