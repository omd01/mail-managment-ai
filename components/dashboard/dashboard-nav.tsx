"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Mail, Settings, LayoutTemplate, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart,
    },
    {
      title: "Templates",
      href: "/templates",
      icon: LayoutTemplate,
    },
    {
      title: "Send Email",
      href: "/send",
      icon: Mail,
    },
    {
      title: "Bulk Email",
      href: "/bulk",
      icon: Mail,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "Identities",
      href: "/identities",
      icon: Mail,
    },
  ]

  return (
    <nav className="grid items-start gap-2 p-4">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-transparent hover:text-primary",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}

      <div className="mt-6 flex flex-col gap-2">
        <ThemeToggle />
        <Button variant="outline" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  )
}
