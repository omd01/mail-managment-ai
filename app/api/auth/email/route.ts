import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { sendEmail } from "@/lib/aws-ses"

// This would handle the initial email OTP request
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Check if user already exists
    let user = await User.findOne({ email })

    if (!user) {
      // Create a new user
      user = await User.create({
        email,
        authProvider: "email",
        isOnboarded: false,
      })
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    // Send email using AWS SES
    const emailResult = await sendEmail({
      from: "noreply@linksus.in",
      to: [email],
      subject: `${otp} is your AiMailer verification code`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 16px;">AiMailer Login Verification</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">Please use the following 6-digit One-Time Password (OTP) to complete your login. This code is valid for 10 minutes.</p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #111827;">${otp}</span>
          </div>
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin-top: 24px;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    })

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error)
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    if (emailResult.simulated) {
      console.log(`[OTP SIMULATION] Generated OTP for ${email}: ${otp}`)
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Include simulated flag if it was simulated so the frontend knows or for logging
      simulated: !!emailResult.simulated
    })
  } catch (error) {
    console.error("Error in email authentication:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
