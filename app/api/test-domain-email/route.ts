import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/aws-ses"
import { getCurrentUser } from "@/lib/auth-utils"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import EmailLog from "@/models/EmailLog"

export async function POST(request: Request) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = user.id
    const { domain, to } = await request.json()

    if (!domain || !to) {
      return NextResponse.json({ error: "Domain and recipient email are required" }, { status: 400 })
    }

    // Get user's domain verification status
    await connectToDatabase()
    const dbUser = await User.findById(userId)

    if (!dbUser || !dbUser.domain || !dbUser.domainVerified) {
      return NextResponse.json({ error: "Domain not verified" }, { status: 400 })
    }

    // Create a test email from the verified domain
    const from = `test@${domain}`
    const subject = "Test Email from AiMailer"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Test Email</h1>
        <p>This is a test email from your verified domain ${domain}.</p>
        <p>If you're seeing this, your domain is properly configured for sending emails with AWS SES.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>You can now use this domain to send emails from your AiMailer account.</p>
        </div>
        <p>Best regards,<br/>The AiMailer Team</p>
      </div>
    `

    // Send the test email
    const result = await sendEmail({
      from,
      to: [to],
      subject,
      html,
    })

    if (!result.success) {
      throw new Error(result.error || "Failed to send test email")
    }

    // Log the email
    const emailLog = new EmailLog({
      userId,
      from,
      to: [to],
      subject,
      status: "sent",
      messageId: result.messageId,
    })

    await emailLog.save()

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
