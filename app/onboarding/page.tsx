import type { Metadata } from "next"
import OnboardingFlow from "@/components/onboarding/onboarding-flow"

export const metadata: Metadata = {
  title: "Onboarding | AiMailer",
  description: "Set up your AiMailer account",
}

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col">
        <OnboardingFlow />
      </div>
    </div>
  )
}
