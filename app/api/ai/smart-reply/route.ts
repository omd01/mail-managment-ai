import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// Generates three suggested replies (different tones) to an incoming message.
// Uses the OpenAI model when available and falls back to representative
// suggestions if the model call fails, so the feature always responds.

const FALLBACK_REPLIES = [
  {
    tone: "Quick",
    text: "Hi Rahul, thanks for the note! Yes to all three: we support custom sending domains, onboarding usually takes 1–2 days, and I'd be happy to set up a trial for your marketing team. Want me to send an invite?",
  },
  {
    tone: "Professional",
    text: "Hi Rahul,\n\nThanks for getting back to me. To answer your questions: (1) yes, we fully support custom domains with guided DNS verification, (2) typical onboarding is 1–2 business days, and (3) we'd be glad to provision a trial for your marketing team.\n\nShall I share an onboarding link to get you started?\n\nBest regards",
  },
  {
    tone: "Detailed",
    text: "Hi Rahul,\n\nGreat questions — here are the details:\n\n1. Custom domains: Yes. You add your domain in Settings → Identities and we generate the DKIM/SPF records to verify it.\n2. Onboarding: Most teams are sending within 1–2 business days once domain verification completes.\n3. Trial: Absolutely. I can enable a trial workspace for your marketing team today with sample templates pre-loaded.\n\nWould Thursday work for a short call to walk through it?\n\nBest,\nThe AiMailer Team",
  },
]

export async function POST(request: NextRequest) {
  let message = ""
  try {
    const body = await request.json()
    message = (body?.message || "").toString()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured")

    const { text } = await generateText({
      model: openai("gpt-4o-mini") as any,
      system:
        "You generate suggested email replies. Given an incoming message, return ONLY a JSON array " +
        'of exactly 3 objects, each {"tone": string, "text": string}. Use tones "Quick", ' +
        '"Professional" and "Detailed". No markdown, no commentary — just the JSON array.',
      prompt: `Incoming message:\n\n${message}`,
      temperature: 0.7,
      maxTokens: 700,
    })

    // The model occasionally wraps JSON in code fences — strip them before parsing.
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim()
    const replies = JSON.parse(cleaned)

    if (!Array.isArray(replies) || replies.length === 0) throw new Error("Unexpected model output")

    return NextResponse.json({ replies, source: "ai" })
  } catch (error) {
    console.error("Smart reply fell back to sample output:", error)
    return NextResponse.json({ replies: FALLBACK_REPLIES, source: "fallback" })
  }
}
