import { FloatingNav } from "@/components/dashboard/floating-nav"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Blueprint grid for dashboard too, to match theme */}
      <div className="blueprint-bg z-0"></div>

      <div className="relative z-10 flex-1 flex flex-col">
        <main className="flex w-full flex-col overflow-hidden pb-24">
          <div className="flex-1 space-y-6 p-8">{children}</div>
        </main>
      </div>

      <FloatingNav />
    </div>
  )
}
