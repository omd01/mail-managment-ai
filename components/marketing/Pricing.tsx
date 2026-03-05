export function Pricing() {
    return (
        <section id="pricing" className="px-8 max-w-[1440px] mx-auto pb-40">
            <h2 className="label-mono mb-12">02 // Pricing Structure</h2>
            <div className="border-t border-neutral-800">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-4 border-b border-neutral-800 py-12 hover:bg-neutral-900/50 transition-colors px-4 cursor-default group">
                    <div className="label-mono text-white text-lg group-hover:translate-x-2 transition-transform">Starter</div>
                    <div className="text-neutral-500 text-sm font-light py-4 md:py-0">1,000 Verifications / Month</div>
                    <div className="text-neutral-500 text-sm font-light">Community Access</div>
                    <div className="text-right text-2xl font-bold">$0</div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-4 border-b border-neutral-800 py-12 hover:bg-neutral-900/50 transition-colors px-4 cursor-default group">
                    <div className="label-mono text-white text-lg group-hover:translate-x-2 transition-transform">Growth</div>
                    <div className="text-neutral-500 text-sm font-light py-4 md:py-0">50,000 Verifications / Month</div>
                    <div className="text-neutral-500 text-sm font-light">Full API + Support</div>
                    <div className="text-right text-2xl font-bold">$149</div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-4 border-b border-neutral-800 py-12 hover:bg-neutral-900/50 transition-colors px-4 cursor-default group">
                    <div className="label-mono text-white text-lg group-hover:translate-x-2 transition-transform">Scale</div>
                    <div className="text-neutral-500 text-sm font-light py-4 md:py-0">Unlimited Throughput</div>
                    <div className="text-neutral-500 text-sm font-light">Dedicated Node Placement</div>
                    <div className="text-right text-2xl font-bold italic">Contact</div>
                </div>
            </div>
        </section>
    )
}
