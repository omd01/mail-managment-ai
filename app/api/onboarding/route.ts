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
    const body = await request.json()
    const { awsRegion, awsAccessKeyId, awsSecretAccessKey, keepExistingSecret, domain } = body

    // Validate required fields
    if (!awsRegion || !awsAccessKeyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // If keepExistingSecret is true, we only update the region and access key
    if (keepExistingSecret) {
      const updateFields: any = {
        awsRegion,
        awsAccessKeyId,
        isOnboarded: true,
      }

      // Add domain if provided
      if (domain) {
        updateFields.domain = domain
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true })

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          isOnboarded: updatedUser.isOnboarded,
          domain: updatedUser.domain,
          domainVerified: updatedUser.domainVerified,
        },
      })
    }

    // Otherwise, update all AWS credentials
    if (!awsSecretAccessKey) {
      return NextResponse.json({ error: "AWS Secret Access Key is required" }, { status: 400 })
    }

    const updateFields: any = {
      awsRegion,
      awsAccessKeyId,
      awsSecretAccessKey,
      isOnboarded: true,
    }

    // Add domain if provided
    if (domain) {
      updateFields.domain = domain
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        isOnboarded: updatedUser.isOnboarded,
        domain: updatedUser.domain,
        domainVerified: updatedUser.domainVerified,
      },
    })
  } catch (error) {
    console.error("Error saving credentials:", error)
    return NextResponse.json(
      {
        error: "Failed to save credentials",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
