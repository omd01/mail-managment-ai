import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = user.id

    // Connect to the database
    await connectToDatabase()

    // Find the user and exclude sensitive fields
    const dbUser = await User.findById(userId).select("-awsSecretAccessKey -__v")

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data
    return NextResponse.json({
      id: dbUser._id,
      email: dbUser.email,
      name: dbUser.name,
      profileImage: dbUser.profileImage,
      authProvider: dbUser.authProvider,
      awsRegion: dbUser.awsRegion,
      awsAccessKeyId: dbUser.awsAccessKeyId,
      isOnboarded: dbUser.isOnboarded,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
