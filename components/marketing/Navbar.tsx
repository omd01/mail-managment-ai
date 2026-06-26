import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-[100] px-8 py-6 flex justify-between items-center border-b border-neutral-200/60 bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <Link href="/" className="font-black text-2xl tracking-tighter text-neutral-900">
                    NOBOUNCE<span className="text-neutral-400">.</span>
                </Link>
            </div>

            <div className="hidden md:flex gap-12">
                <Link href="#infrastructure" className="label-mono text-neutral-600 hover:text-black transition-colors">Infrastructure</Link>
                <Link href="#integration" className="label-mono text-neutral-600 hover:text-black transition-colors">Integrations</Link>
                <Link href="#pricing" className="label-mono text-neutral-600 hover:text-black transition-colors">Pricing</Link>
            </div>

            <Link href="/login">
                <button className="label-mono border border-neutral-900 text-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-all bg-transparent cursor-pointer rounded-md">
                    Access Terminal
                </button>
            </Link>
        </nav>
    )
}
