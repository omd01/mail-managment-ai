import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = session.user.id

    // Connect to the database
    await connectToDatabase()

    // Find the user and exclude sensitive fields
    const user = await User.findById(userId).select("-awsSecretAccessKey -__v")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data
    return NextResponse.json({
      id: user._id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      authProvider: user.authProvider,
      awsRegion: user.awsRegion,
      awsAccessKeyId: user.awsAccessKeyId,
      isOnboarded: user.isOnboarded,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
