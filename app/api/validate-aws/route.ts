import { NextResponse } from "next/server"
import { SESClient, GetSendQuotaCommand } from "@aws-sdk/client-ses"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { awsRegion, awsAccessKeyId, awsSecretAccessKey } = body

    console.log("Validating AWS credentials:", {
      awsRegion,
      awsAccessKeyId,
      hasSecretKey: !!awsSecretAccessKey,
    })

    // Validate required fields
    if (!awsRegion) {
      return NextResponse.json({ error: "AWS Region is required" }, { status: 400 })
    }

    if (!awsAccessKeyId) {
      return NextResponse.json({ error: "AWS Access Key ID is required" }, { status: 400 })
    }

    if (!awsSecretAccessKey) {
      return NextResponse.json({ error: "AWS Secret Access Key is required" }, { status: 400 })
    }

    // Skip validation if using masked secret key (user didn't change it)
    if (awsSecretAccessKey === "••••••••••••••••") {
      return NextResponse.json({
        success: true,
        message: "Using existing credentials",
      })
    }

    // Initialize SES client with provided credentials
    const sesClient = new SESClient({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    })

    // Test the credentials by making a simple API call
    const command = new GetSendQuotaCommand({})
    const response = await sesClient.send(command)

    // If we get here, the credentials are valid
    return NextResponse.json({
      success: true,
      quotaData: {
        max24HourSend: response.Max24HourSend,
        maxSendRate: response.MaxSendRate,
        sentLast24Hours: response.SentLast24Hours,
      },
    })
  } catch (error) {
    console.error("Error validating AWS credentials:", error)

    // Determine if it's an authentication error
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const isAuthError =
      errorMessage.includes("auth") || errorMessage.includes("credentials") || errorMessage.includes("not authorized")

    return NextResponse.json(
      {
        error: isAuthError
          ? "Invalid AWS credentials. Please check your Access Key ID and Secret Access Key."
          : "Failed to validate AWS credentials. Please ensure your region is correct and SES is enabled.",
        details: errorMessage,
      },
      { status: 400 },
    )
  }
}
