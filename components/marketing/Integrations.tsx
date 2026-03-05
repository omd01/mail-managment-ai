export function Integrations() {
    return (
        <section id="integration" className="px-8 max-w-[1440px] mx-auto pb-20">
            <div className="flex flex-wrap gap-4 items-center justify-center opacity-60">
                <span className="label-mono mr-4 text-neutral-400">Native Connectors:</span>
                <div className="px-5 py-2 border border-neutral-700 text-[10px] font-mono text-neutral-400">AWS_SES</div>
                <div className="px-5 py-2 border border-neutral-700 text-[10px] font-mono text-neutral-400">RESEND_API</div>
                <div className="px-5 py-2 border border-neutral-700 text-[10px] font-mono text-neutral-400">POSTMARK_APP</div>
                <div className="px-5 py-2 border border-neutral-700 text-[10px] font-mono text-neutral-400">SENDGRID_V3</div>
                <div className="px-5 py-2 border border-neutral-700 text-[10px] font-mono text-neutral-400">MAILGUN_CLOUD</div>
            </div>
        </section>
    )
}
