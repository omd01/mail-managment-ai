import type React from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AiMailer.in</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:flex">
                Login
              </Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-10">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <span className="text-lg font-bold">AiMailer.in</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 AiMailer.in. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="/legal/terms" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="/legal" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Legal
            </Link>
            <Link
              href="https://github.com/aimailer/aimailer"
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              GitHub
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
