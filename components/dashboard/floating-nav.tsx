"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    BarChart,
    Mail,
    Settings,
    LayoutTemplate,
    LogOut,
    Send,
    Cable,
    Inbox,
    FileText,
    Reply,
    ShieldAlert,
} from "lucide-react"
import { signOut } from "next-auth/react"

import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function FloatingNav() {
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
            icon: Send,
        },
        {
            title: "Bulk Email",
            href: "/bulk",
            icon: Mail,
        },
        {
            title: "Integrations",
            href: "/integrations",
            icon: Cable,
        },
        {
            title: "Identities",
            href: "/identities",
            icon: Mail,
        },
    ]

    // AI-assist tools — grouped separately in the nav.
    const aiItems = [
        {
            title: "Inbox",
            href: "/inbox",
            icon: Inbox,
        },
        {
            title: "AI Summary",
            href: "/summarize",
            icon: FileText,
        },
        {
            title: "Smart Reply",
            href: "/smart-reply",
            icon: Reply,
        },
        {
            title: "Spam Detection",
            href: "/spam",
            icon: ShieldAlert,
        },
    ]

    const renderItem = (item: { title: string; href: string; icon: typeof BarChart }) => (
        <Tooltip key={item.href}>
            <TooltipTrigger asChild>
                <Link
                    href={item.href}
                    className={cn(
                        "flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200",
                        pathname === item.href
                            ? "bg-neutral-900 text-white shadow-sm scale-110"
                            : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 hover:scale-110"
                    )}
                >
                    <item.icon className="w-5 h-5" />
                    <span className="sr-only">{item.title}</span>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-neutral-900 border-neutral-800 text-white label-mono text-[10px] mb-2">
                {item.title}
            </TooltipContent>
        </Tooltip>
    )

    return (
        <div className="fixed bottom-[20px] left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-neutral-200/80 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <TooltipProvider delayDuration={0}>
                    {navItems.map(renderItem)}

                    <div className="w-px h-8 bg-neutral-200 mx-1" />

                    {aiItems.map(renderItem)}

                    <div className="w-px h-8 bg-neutral-200 mx-1" />

                    {/* Settings */}
                    {renderItem({ title: "Settings", href: "/settings", icon: Settings })}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="flex items-center justify-center w-11 h-11 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:scale-110"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="sr-only">Logout</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-neutral-900 border-neutral-800 text-white label-mono text-[10px] mb-2">
                            Logout
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}
