import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { initializeUserData } from "@/lib/user-utils"

// This would handle Google authentication callback
export async function POST(request: Request) {
  try {
    // In a real implementation, this would validate a Google token
    // For demo purposes, we'll just use the provided email
    const { email, name, profileImage } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Check if user already exists
    let user = await User.findOne({ email })
    let isNewUser = false

    if (!user) {
      // Create a new user
      user = await User.create({
        email,
        name,
        profileImage,
        authProvider: "google",
        isOnboarded: false,
      })
      isNewUser = true
    } else {
      // Update existing user's Google info
      user.name = name || user.name
      user.profileImage = profileImage || user.profileImage
      user.authProvider = "google"
      await user.save()
    }

    // Initialize user data if new user
    if (isNewUser || !user.isOnboarded) {
      const initResult = await initializeUserData(user._id.toString())

      if (!initResult.success) {
        console.error("Failed to initialize user data:", initResult.error)
        // Continue anyway, as this shouldn't block login
      }
    }

    // Generate a session token (in a real app, use a proper auth library)
    const token = Math.random().toString(36).substring(2, 15)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isOnboarded: user.isOnboarded,
      },
    })
  } catch (error) {
    console.error("Error in Google authentication:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
