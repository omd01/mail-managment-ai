import { Navbar } from "@/components/marketing/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { Integrations } from "@/components/marketing/Integrations"
import { Features } from "@/components/marketing/Features"
import { UseCases } from "@/components/marketing/UseCases"
import { Pricing } from "@/components/marketing/Pricing"
import { Footer } from "@/components/marketing/Footer"

export default function Home() {
  return (
    <div className="min-h-screen text-foreground selection:bg-white selection:text-black">
      <div className="blueprint-bg"></div>
      <Navbar />
      <main>
        <Hero />
        <Integrations />
        <Features />
        <UseCases />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
