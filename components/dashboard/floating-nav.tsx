"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Mail, Settings, LayoutTemplate, LogOut, Send, Cable } from "lucide-react"
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

        {
            title: "Settings",
            href: "/settings",
            icon: Settings,
        }
    ]

    return (
        <div className="fixed bottom-[20px] left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-8 px-8 py-3 rounded-full border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => (
                        <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
                                        pathname === item.href
                                            ? "bg-white text-black border border-white scale-110"
                                            : "text-neutral-400 hover:text-white hover:bg-white/10 hover:scale-110"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="sr-only">{item.title}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-black border-white/10 text-white label-mono text-[10px] mb-2">
                                {item.title}
                            </TooltipContent>
                        </Tooltip>
                    ))}

                    <div className="w-px h-8 bg-white/10 mx-2" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="flex items-center justify-center w-12 h-12 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 hover:scale-110"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="sr-only">Logout</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-black border-white/10 text-white label-mono text-[10px] mb-2">
                            Logout
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}
