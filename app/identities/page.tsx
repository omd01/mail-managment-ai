import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { EmailSettings } from "@/components/settings/email-settings"
import { Loader2 } from "lucide-react"

export const metadata = {
    title: "Identities",
    description: "Manage your verified email identities.",
}

export default function IdentitiesPage() {
    return (
        <DashboardShell>
            <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto w-full">
                <DashboardHeader
                    heading="Identities"
                    text="Manage the email addresses and domains you use to send messages."
                />

                <div className="grid gap-8">
                    <div className="relative bg-white rounded-xl border border-neutral-200 p-6 md:p-8 shadow-sm">
                        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-neutral-900" /></div>}>
                            <EmailSettings />
                        </Suspense>
                    </div>
                </div>
            </div>
        </DashboardShell>
    )
}
