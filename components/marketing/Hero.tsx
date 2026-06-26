import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
    return (
        <header className="pt-56 pb-32 px-8 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="label-mono max-w-xs leading-relaxed">
                    [Protocol_v.04] Verification engine built for high-scale transactional systems.
                </div>
                <div className="label-mono text-right">
                    Status: Operational<br />
                    Nodes: Global / 42
                </div>
            </div>

            <h1 className="display-large mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 text-neutral-900">
                PRECISION <br />
                DELIVERY<span className="text-indigo-600">.</span>
            </h1>

            <div className="flex flex-col md:flex-row gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <Link href="/login">
                    <button className="btn-handcrafted">Deploy Verification Engine</button>
                </Link>
                <p className="text-neutral-600 max-w-sm text-sm font-light leading-relaxed">
                    Eliminate bounces before they happen. Our handcrafted SMTP protocol ensures 99.9% accuracy with zero packet loss.
                </p>
            </div>
        </header>
    )
}
