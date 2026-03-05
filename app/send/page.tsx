import { Suspense } from "react"
import { SendEmailForm } from "@/components/send/send-email-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Send Email",
  description: "Send emails using your custom templates",
}

// Loading fallback component
function SendEmailFormSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  )
}

export default function SendEmailPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Send Email" text="Send emails using your custom templates." />
      <Suspense fallback={<SendEmailFormSkeleton />}>
        <SendEmailForm />
      </Suspense>
    </DashboardShell>
  )
}
