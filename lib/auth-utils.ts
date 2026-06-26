import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function getCurrentUser() {
  try {
    // 1. Try NextAuth session (Google login)
    const session = await getServerSession(authOptions)

    await connectToDatabase()

    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email }).select("-awsSecretAccessKey")
      if (user) {
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          isOnboarded: user.isOnboarded,
          hasAwsCredentials: !!(user.awsAccessKeyId && user.awsSecretAccessKey && user.awsRegion),
        }
      }
    }

    // 2. Try custom JWT token from cookie (OTP email login)
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        if (decoded?.userId) {
          const user = await User.findById(decoded.userId).select("-awsSecretAccessKey")
          if (user) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              isOnboarded: user.isOnboarded,
              hasAwsCredentials: !!(user.awsAccessKeyId && user.awsSecretAccessKey && user.awsRegion),
            }
          }
        }
      } catch (jwtError) {
        console.error("JWT verification failed in getCurrentUser:", jwtError)
      }
    }

    return null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
