import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-[100] px-8 py-6 flex justify-between items-center border-b border-white/5 bg-black/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <Link href="/" className="font-black text-2xl tracking-tighter">
                    NOBOUNCE<span className="text-neutral-600">.</span>
                </Link>
            </div>

            <div className="hidden md:flex gap-12">
                <Link href="#infrastructure" className="label-mono hover:text-white transition-colors">Infrastructure</Link>
                <Link href="#integration" className="label-mono hover:text-white transition-colors">Integrations</Link>
                <Link href="#pricing" className="label-mono hover:text-white transition-colors">Pricing</Link>
            </div>

            <Link href="/login">
                <button className="label-mono border border-neutral-600 px-4 py-2 hover:bg-white hover:text-black transition-all bg-transparent">
                    Access Terminal
                </button>
            </Link>
        </nav>
    )
}
