export function UseCases() {
    return (
        <section className="px-8 max-w-[1440px] mx-auto pb-40">
            <h2 className="label-mono mb-12">02 // Industrial Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group hover:bg-neutral-100/70 p-4 transition-colors rounded">
                    <h4 className="font-bold mb-4 uppercase tracking-tighter text-lg text-neutral-900">Fintech Registration</h4>
                    <p className="text-neutral-600 text-sm font-light leading-relaxed">Prevent fraudulent signups at the entry point. Verify KYC emails in real-time before they even click 'Submit'.</p>
                </div>
                <div className="group hover:bg-neutral-100/70 p-4 transition-colors rounded">
                    <h4 className="font-bold mb-4 uppercase tracking-tighter text-lg text-neutral-900">E-Commerce Recovery</h4>
                    <p className="text-neutral-600 text-sm font-light leading-relaxed">Automatically fix typos in abandoned cart emails. Change 'gnail.com' to 'gmail.com' and recover 15% more revenue.</p>
                </div>
                <div className="group hover:bg-neutral-100/70 p-4 transition-colors rounded">
                    <h4 className="font-bold mb-4 uppercase tracking-tighter text-lg text-neutral-900">SaaS Cold Outreach</h4>
                    <p className="text-neutral-600 text-sm font-light leading-relaxed">Protect your primary domain. Handcrafted AI personalization ensures your outreach feels human, not automated.</p>
                </div>
            </div>
        </section>
    )
}
