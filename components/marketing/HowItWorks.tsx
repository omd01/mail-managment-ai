import { Upload, Search, Download, ArrowRight } from "lucide-react"

export function HowItWorks() {
    const steps = [
        {
            id: "01",
            title: "Upload Your List",
            desc: "Drag and drop your CSV or connect via API.",
            icon: <Upload className="w-6 h-6 text-white" />,
            color: "bg-blue-500",
        },
        {
            id: "02",
            title: "AI Analysis",
            desc: "Our engine checks syntax, clearMX, and existence.",
            icon: <Search className="w-6 h-6 text-white" />,
            color: "bg-violet-500",
        },
        {
            id: "03",
            title: "Clean Download",
            desc: "Get your verified list, ready for campaigning.",
            icon: <Download className="w-6 h-6 text-white" />,
            color: "bg-fuchsia-500",
        },
    ]

    return (
        <section id="how-it-works" className="py-24 bg-black/40 border-y border-white/5">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">How it Works</h2>
                    <p className="text-muted-foreground">Clean your email lists in 3 simple steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/0 via-violet-500/50 to-fuchsia-500/0 border-t border-dashed border-white/20 z-0" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                            <div className={`w-24 h-24 rounded-3xl ${step.color} bg-opacity-10 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2`}>
                                <div className={`absolute inset-0 ${step.color} opacity-20 blur-xl rounded-full`} />
                                <div className="relative z-10">{step.icon}</div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border border-white/10 flex items-center justify-center text-xs font-bold font-mono">
                                    {step.id}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground text-sm max-w-[200px]">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
