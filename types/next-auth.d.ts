import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id?: string
      isOnboarded?: boolean
      hasAwsCredentials?: boolean
    } & DefaultSession["user"]
  }
}
