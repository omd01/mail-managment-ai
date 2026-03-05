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

export async function GET() {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's AWS credentials
    await connectToDatabase()
    const user = await User.findById(userId)

    if (!user || !user.awsRegion || !user.awsAccessKeyId || !user.awsSecretAccessKey) {
      return NextResponse.json({ error: "AWS credentials not found" }, { status: 400 })
    }

    // Initialize SES client with user's credentials
    const sesClient = new SESClient({
      region: user.awsRegion,
      credentials: {
        accessKeyId: user.awsAccessKeyId,
        secretAccessKey: user.awsSecretAccessKey,
      },
    })

    // Check account status and get quota information
    const accountStatus = await checkSandboxStatus(sesClient)

    return NextResponse.json(accountStatus)
  } catch (error) {
    console.error("Error fetching SES quota:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch SES quota",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
