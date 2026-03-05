export function SocialProof() {
    const companies = [
        { name: "Acme Corp", logo: "/placeholder-logo.svg?text=Acme" },
        { name: "GlobalTech", logo: "/placeholder-logo.svg?text=GlobalTech" },
        { name: "Nebula", logo: "/placeholder-logo.svg?text=Nebula" },
        { name: "Starlight", logo: "/placeholder-logo.svg?text=Starlight" },
        { name: "Umbrella", logo: "/placeholder-logo.svg?text=Umbrella" },
    ]

    return (
        <section className="py-12 border-y border-white/5 bg-black/20">
            <div className="container px-4 md:px-6">
                <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                    TRUSTED BY INNOVATIVE TEAMS WORLDWIDE
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70">
                    {companies.map((company, i) => (
                        <div key={i} className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100">
                            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white/80 to-white/40 select-none">
                                {company.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
