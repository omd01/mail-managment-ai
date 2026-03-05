import type { Metadata } from "next"
import Link from "next/link"
import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Access Terminal | NoBounce",
  description: "Secure login for NoBounce verification engine",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Grid */}
      <div className="blueprint-bg"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link href="/" className="inline-block mb-6">
            <span className="font-black text-2xl tracking-tighter">NOBOUNCE<span className="text-neutral-600">.</span></span>
          </Link>
          <div className="label-mono mb-2 text-neutral-500">System Access</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Initialize Session</h1>
          <p className="text-neutral-500 text-sm">Enter credentials to access the verification engine.</p>
        </div>

        <div className="editorial-card p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <LoginForm />
        </div>

        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex justify-center gap-6 label-mono text-[10px] text-neutral-600">
            <Link href="/terms" className="hover:text-neutral-400 transition-colors">Protocol_Terms</Link>
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">Data_Privacy</Link>
            <span>v.0.4.2</span>
          </div>
        </div>
      </div>
    </div>
  )
}
