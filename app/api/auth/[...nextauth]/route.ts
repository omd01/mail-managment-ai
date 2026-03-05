import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { initializeUserData } from "@/lib/user-utils"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken

      // Add user ID to session
      if (session.user?.email) {
        await connectToDatabase()
        const user = await User.findOne({ email: session.user.email })

        if (user) {
          session.user.id = user._id.toString()
          session.user.isOnboarded = user.isOnboarded

          // Check if AWS credentials are provided
          session.user.hasAwsCredentials = !!(user.awsAccessKeyId && user.awsSecretAccessKey && user.awsRegion)
        }
      }

      return session
    },
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false
      }

      try {
        await connectToDatabase()

        // Check if user exists
        let dbUser = await User.findOne({ email: user.email })
        let isNewUser = false

        if (!dbUser) {
          // Create new user
          dbUser = await User.create({
            email: user.email,
            name: user.name,
            profileImage: user.image,
            authProvider: "google",
            isOnboarded: false,
          })
          isNewUser = true
        } else {
          // Update existing user
          dbUser.name = user.name || dbUser.name
          dbUser.profileImage = user.image || dbUser.profileImage
          dbUser.authProvider = "google"
          await dbUser.save()
        }

        // Initialize user data if new user
        if (isNewUser || !dbUser.isOnboarded) {
          await initializeUserData(dbUser._id.toString())
        }

        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return false
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.JWT_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
