import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return null
    }

    // Get user from database
    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email }).select("-awsSecretAccessKey")

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isOnboarded: user.isOnboarded,
      hasAwsCredentials: !!(user.awsAccessKeyId && user.awsSecretAccessKey && user.awsRegion),
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
