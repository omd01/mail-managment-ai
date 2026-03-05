import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { initializeUserData } from "@/lib/user-utils"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

// In a real app, you'd use a proper JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// This would handle the OTP verification
export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Find the user
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // In a real implementation, verify the OTP
    // For demo purposes, we'll just check if it's 6 digits
    if (otp.length !== 6) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    // Check if user needs initialization
    if (!user.isOnboarded) {
      // Initialize user data
      const initResult = await initializeUserData(user._id.toString())

      if (!initResult.success) {
        console.error("Failed to initialize user data:", initResult.error)
        // Continue anyway, as this shouldn't block login
      }
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" })

    // Set the token in a cookie
    const cookieStore = cookies()
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isOnboarded: user.isOnboarded,
      },
    })
  } catch (error) {
    console.error("Error in OTP verification:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
