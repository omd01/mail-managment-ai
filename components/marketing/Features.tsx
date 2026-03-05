export function Features() {
    return (
        <section id="infrastructure" className="px-8 max-w-[1440px] mx-auto pb-40">
            <div className="line-accent"></div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-1 px-0 bg-neutral-900 border border-neutral-900 overflow-hidden">
                {/* Feature 1: The Core Tech */}
                <div className="col-span-1 md:col-span-8 editorial-card p-12 relative h-[500px] flex flex-col justify-end group">
                    <span className="spec-number">#001_CORE</span>
                    <div className="max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <h3 className="text-3xl font-bold mb-6 tracking-tight">Real-Time SMTP Handshake</h3>
                        <p className="text-neutral-400 font-light mb-8">
                            We don't just check syntax. We simulate the delivery process at the edge, communicating directly with receiving servers to verify mailbox existence in <span className="text-white">~34ms</span>.
                        </p>
                        <div className="flex gap-4">
                            <div className="px-3 py-1 bg-neutral-800 label-mono text-[9px] text-neutral-300">gRPC Ready</div>
                            <div className="px-3 py-1 bg-neutral-800 label-mono text-[9px] text-neutral-300">Low Latency</div>
                        </div>
                    </div>
                </div>

                {/* Feature 2: Data Visual */}
                <div className="col-span-1 md:col-span-4 editorial-card p-12 relative flex flex-col items-center justify-center bg-white text-black group">
                    <span className="spec-number !text-neutral-400">#002_METRIC</span>
                    <div className="text-center animate-in scale-in-95 duration-700 delay-300">
                        <div className="text-8xl font-black tracking-tighter mb-2">99.9%</div>
                        <div className="label-mono !text-black/60">Accuracy Threshold</div>
                    </div>
                </div>

                {/* Feature 3: AI Intelligence */}
                <div className="col-span-1 md:col-span-6 editorial-card p-12 relative h-[450px] group">
                    <span className="spec-number">#003_GEN_AI</span>
                    <h3 className="text-xl font-bold mb-4 tracking-tight uppercase">AI Content Orchestration</h3>
                    <p className="text-neutral-400 text-sm font-light leading-relaxed mb-12">
                        Generate hyper-personalized templates in seconds. Our AI analyzes recipient metadata to craft unique subject lines and bodies that bypass "Promotions" tabs automatically.
                    </p>
                    <div className="bg-black border border-neutral-800 p-4 rounded font-mono text-[10px] text-neutral-400">
                        <div className="text-indigo-400 mb-2">// Generating variant based on user_persona: "Developer"</div>
                        "Hey {"{name}"}, saw your latest commit on {"{repo}"}. Our gRPC verification node..."
                    </div>
                </div>

                {/* Feature 4: Bulk Mailer */}
                <div className="col-span-1 md:col-span-6 editorial-card p-12 relative h-[450px] bg-neutral-100 text-black group">
                    <span className="spec-number !text-neutral-400">#004_BULK</span>
                    <h3 className="text-xl font-bold mb-4 tracking-tight uppercase">High-Volume Relay</h3>
                    <p className="text-neutral-700 text-sm font-medium leading-relaxed">
                        Built for the 1%. Send millions of emails without the warm-up period. Our intelligent relay dynamically switches between AWS SES and Resend to maintain peak throughput.
                    </p>
                    <div className="mt-24 flex items-end gap-1 h-20">
                        <div className="flex-1 bg-black h-1/4 group-hover:h-2/4 transition-all duration-300"></div>
                        <div className="flex-1 bg-black h-2/4 group-hover:h-3/4 transition-all duration-300 delay-75"></div>
                        <div className="flex-1 bg-black h-full group-hover:h-3/4 transition-all duration-300 delay-150"></div>
                        <div className="flex-1 bg-black h-3/4 group-hover:h-full transition-all duration-300 delay-200"></div>
                        <div className="flex-1 bg-black h-full group-hover:h-1/2 transition-all duration-300 delay-300"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
