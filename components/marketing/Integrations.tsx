export function Integrations() {
    return (
        <section id="integration" className="px-8 max-w-[1440px] mx-auto pb-20">
            <div className="flex flex-wrap gap-4 items-center justify-center opacity-80">
                <span className="label-mono mr-4 text-neutral-500">Native Connectors:</span>
                <div className="px-5 py-2 border border-neutral-200 text-[10px] font-mono text-neutral-600 bg-neutral-50/50 rounded shadow-sm">AWS_SES</div>
                <div className="px-5 py-2 border border-neutral-200 text-[10px] font-mono text-neutral-600 bg-neutral-50/50 rounded shadow-sm">RESEND_API</div>
                <div className="px-5 py-2 border border-neutral-200 text-[10px] font-mono text-neutral-600 bg-neutral-50/50 rounded shadow-sm">POSTMARK_APP</div>
                <div className="px-5 py-2 border border-neutral-200 text-[10px] font-mono text-neutral-600 bg-neutral-50/50 rounded shadow-sm">SENDGRID_V3</div>
                <div className="px-5 py-2 border border-neutral-200 text-[10px] font-mono text-neutral-600 bg-neutral-50/50 rounded shadow-sm">MAILGUN_CLOUD</div>
            </div>
        </section>
    )
}
