import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { getCurrentUser } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = user.id
    const { domain, verified } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Update user's domain verification status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        domain,
        domainVerified: verified,
      },
      { new: true },
    )

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      domain,
      verified,
    })
  } catch (error) {
    console.error("Error updating domain verification:", error)
    return NextResponse.json(
      {
        error: "Failed to update domain verification",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
