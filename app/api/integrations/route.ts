import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Integration from "@/models/Integration"
import { getCurrentUser } from "@/lib/auth-utils"

const PROVIDERS = ["aws", "resend"] as const

// Mask a secret so it can be shown in the UI without leaking the full value.
function maskMiddle(value?: string, start = 4, end = 4) {
  if (!value) return ""
  if (value.length <= start + end) return "••••••••"
  return `${value.slice(0, start)}${"•".repeat(8)}${value.slice(-end)}`
}

function maskCredentials(provider: string, creds: any) {
  if (!creds) return null
  if (provider === "aws") {
    return {
      accessKeyId: maskMiddle(creds.accessKeyId),
      // Never reveal any part of the secret key.
      secretAccessKey: creds.secretAccessKey ? "••••••••••••••••" : "",
      region: creds.region || "",
    }
  }
  if (provider === "resend") {
    return { apiKey: maskMiddle(creds.apiKey, 3, 4) }
  }
  return null
}

// Credentials available from environment variables (system-level fallback).
function envCredentials(provider: string) {
  if (provider === "aws" && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || "us-east-1",
    }
  }
  if (provider === "resend" && process.env.RESEND_API_KEY) {
    return { apiKey: process.env.RESEND_API_KEY }
  }
  return null
}

// Save / replace full credentials for a provider.
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { provider, credentials, isActive } = body

    if (!provider || !credentials) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    const integration = await Integration.findOneAndUpdate(
      { userId: user.id, provider },
      {
        credentials,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      },
      { new: true, upsert: true },
    )

    return NextResponse.json({
      success: true,
      integration: { provider: integration.provider, isActive: integration.isActive },
    })
  } catch (error) {
    console.error("Error saving integration:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Toggle active state without re-entering credentials. When enabling a provider
// that has no stored record but does have env credentials, a record is created
// from those so the integration becomes usable.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { provider, isActive } = await request.json()
    if (!provider || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Missing provider or isActive" }, { status: 400 })
    }

    await connectToDatabase()
    let integration = await Integration.findOne({ userId: user.id, provider })

    if (!integration) {
      if (!isActive) {
        // Nothing stored and disabling — nothing to do.
        return NextResponse.json({ success: true, integration: { provider, isActive: false } })
      }
      const env = envCredentials(provider)
      if (!env) {
        return NextResponse.json(
          { error: "No credentials configured. Add credentials first." },
          { status: 400 },
        )
      }
      integration = await Integration.create({ userId: user.id, provider, credentials: env, isActive: true })
    } else {
      integration.isActive = isActive
      integration.updatedAt = new Date()
      await integration.save()
    }

    return NextResponse.json({
      success: true,
      integration: { provider, isActive: integration.isActive },
    })
  } catch (error) {
    console.error("Error toggling integration:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const stored = await Integration.find({ userId: user.id })
    const byProvider: Record<string, any> = {}
    stored.forEach((i) => {
      byProvider[i.provider] = i
    })

    const integrations = PROVIDERS.map((provider) => {
      const dbInt = byProvider[provider]
      if (dbInt) {
        return {
          provider,
          isActive: dbInt.isActive,
          configured: true,
          source: "database",
          masked: maskCredentials(provider, dbInt.credentials),
        }
      }
      // No stored record — surface env credentials as an available (but inactive) option.
      const env = envCredentials(provider)
      if (env) {
        return { provider, isActive: false, configured: true, source: "env", masked: maskCredentials(provider, env) }
      }
      return { provider, isActive: false, configured: false, source: null, masked: null }
    })

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error("Error fetching integrations:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
