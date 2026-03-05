import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProfileSettings } from "@/components/settings/profile-settings"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
}

// Add dynamic segment to force revalidation on each request
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto w-full">
        <DashboardHeader heading="Settings" text="Manage your account preferences and profile." />

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-black rounded-xl border border-neutral-800 p-6 md:p-8 overflow-hidden">
            <ProfileSettings />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
