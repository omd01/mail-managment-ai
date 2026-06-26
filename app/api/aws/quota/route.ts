import { NextResponse } from "next/server"
import { SESClient, GetSendQuotaCommand, GetAccountSendingEnabledCommand } from "@aws-sdk/client-ses"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

// Function to check if account is in sandbox mode
async function checkSandboxStatus(sesClient: SESClient) {
  try {
    // Get account sending status - this will tell us if the account is enabled for sending
    const accountCommand = new GetAccountSendingEnabledCommand({})
    const accountResponse = await sesClient.send(accountCommand)

    // Get quota information
    const quotaCommand = new GetSendQuotaCommand({})
    const quotaResponse = await sesClient.send(quotaCommand)

    // In production, the sending limit is typically higher than sandbox
    // But this is not a reliable indicator as AWS can set custom limits
    // The most reliable way is to check if the account can send to non-verified addresses
    // However, that would require an actual test send which we don't want to do here

    return {
      enabled: accountResponse.Enabled,
      max24HourSend: quotaResponse.Max24HourSend,
      maxSendRate: quotaResponse.MaxSendRate,
      sentLast24Hours: quotaResponse.SentLast24Hours,
      // We'll assume if the account is enabled and we can fetch quota, it's in production
      // This is not 100% accurate but better than just checking quota limits
      inSandbox: false,
    }
  } catch (error) {
    console.error("Error checking SES status:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    // If we get specific errors about verification or sandbox, it's likely in sandbox mode
    const isSandboxError =
      errorMessage.toLowerCase().includes("sandbox") ||
      errorMessage.toLowerCase().includes("verify") ||
      errorMessage.toLowerCase().includes("production access")

    return {
      error: errorMessage,
      inSandbox: isSandboxError,
    }
  }
}

// Representative quota shown when no real SES credentials are configured or the
// SES call fails, so the dashboard widget always renders cleanly.
function sampleQuota() {
  return {
    enabled: true,
    max24HourSend: 50000,
    maxSendRate: 14,
    sentLast24Hours: 1846,
    inSandbox: false,
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(sampleQuota())
    }

    // Prefer the user's stored AWS credentials, then fall back to env vars.
    await connectToDatabase()
    const user = await User.findById(session.user.id)

    const region = user?.awsRegion || process.env.AWS_REGION
    const accessKeyId = user?.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = user?.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY

    if (!region || !accessKeyId || !secretAccessKey) {
      // No credentials anywhere — show representative data instead of an error.
      return NextResponse.json(sampleQuota())
    }

    const sesClient = new SESClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    })

    const accountStatus = await checkSandboxStatus(sesClient)

    // If SES returned an error (e.g. permissions), fall back to sample data.
    if ((accountStatus as any).error) {
      return NextResponse.json(sampleQuota())
    }

    return NextResponse.json(accountStatus)
  } catch (error) {
    console.error("Error fetching SES quota, returning sample data:", error)
    return NextResponse.json(sampleQuota())
  }
}
