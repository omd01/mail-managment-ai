import { NextResponse } from "next/server"
import {
  SESClient,
  VerifyDomainIdentityCommand,
  VerifyDomainDkimCommand,
  GetIdentityVerificationAttributesCommand,
  GetIdentityDkimAttributesCommand,
} from "@aws-sdk/client-ses"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = session.user.id
    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Get user's AWS credentials
    await connectToDatabase()
    const user = await User.findById(userId)

    if (!user || !user.awsRegion || !user.awsAccessKeyId || !user.awsSecretAccessKey) {
      return NextResponse.json({ error: "AWS credentials not found" }, { status: 400 })
    }

    // Initialize SES client with user's credentials
    const sesClient = new SESClient({
      region: user.awsRegion,
      credentials: {
        accessKeyId: user.awsAccessKeyId,
        secretAccessKey: user.awsSecretAccessKey,
      },
    })

    // Check if domain is already verified
    const verificationCommand = new GetIdentityVerificationAttributesCommand({
      Identities: [domain],
    })

    const verificationResponse = await sesClient.send(verificationCommand)
    const verificationAttributes = verificationResponse.VerificationAttributes || {}

    // Check DKIM status
    const dkimCommand = new GetIdentityDkimAttributesCommand({
      Identities: [domain],
    })

    const dkimResponse = await sesClient.send(dkimCommand)
    const dkimAttributes = dkimResponse.DkimAttributes || {}

    // If domain is not in the verification attributes, it hasn't been registered yet
    if (!verificationAttributes[domain]) {
      // Register the domain with SES
      const verifyDomainCommand = new VerifyDomainIdentityCommand({
        Domain: domain,
      })

      const verifyDomainResponse = await sesClient.send(verifyDomainCommand)

      // Generate DKIM records
      const verifyDkimCommand = new VerifyDomainDkimCommand({
        Domain: domain,
      })

      const verifyDkimResponse = await sesClient.send(verifyDkimCommand)

      // Prepare verification records
      const verificationRecords = [
        {
          type: "TXT",
          name: `_amazonses.${domain}`,
          value: verifyDomainResponse.VerificationToken,
        },
      ]

      // Add DKIM records
      if (verifyDkimResponse.DkimTokens) {
        verifyDkimResponse.DkimTokens.forEach((token) => {
          verificationRecords.push({
            type: "CNAME",
            name: `${token}._domainkey.${domain}`,
            value: `${token}.dkim.amazonses.com`,
          })
        })
      }

      // Save domain to user record
      user.domain = domain
      user.domainVerified = false
      await user.save()

      return NextResponse.json({
        verified: false,
        verificationRecords,
      })
    }

    // Check if domain is verified
    const isVerified = verificationAttributes[domain]?.VerificationStatus === "Success"
    const isDkimVerified = dkimAttributes[domain]?.DkimVerificationStatus === "Success"

    // If domain is verified, update user record
    if (isVerified) {
      user.domain = domain
      user.domainVerified = true
      await user.save()
    }

    return NextResponse.json({
      verified: isVerified,
      dkimVerified: isDkimVerified,
      verificationStatus: verificationAttributes[domain]?.VerificationStatus,
      dkimVerificationStatus: dkimAttributes[domain]?.DkimVerificationStatus,
    })
  } catch (error) {
    console.error("Error verifying domain:", error)
    return NextResponse.json(
      {
        error: "Failed to verify domain",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
