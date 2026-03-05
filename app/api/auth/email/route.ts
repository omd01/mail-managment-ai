import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

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

    // In a real implementation, generate and send OTP
    // For demo purposes, we'll just return success

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    })
  } catch (error) {
    console.error("Error in email authentication:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
