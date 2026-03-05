import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Integration from "@/models/Integration"
import { getCurrentUser } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { provider, credentials, isActive } = body

        if (!provider || !credentials) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        await connectToDatabase()

        // Upsert integration
        const integration = await Integration.findOneAndUpdate(
            { userId: user.id, provider },
            {
                credentials,
                isActive: isActive !== undefined ? isActive : true,
                updatedAt: new Date()
            },
            { new: true, upsert: true }
        )

        return NextResponse.json({ success: true, integration: { provider: integration.provider, isActive: integration.isActive } })
    } catch (error) {
        console.error("Error saving integration:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectToDatabase()

        const integrations = await Integration.find({ userId: user.id }).select('provider isActive')

        // Return map of provider -> active status
        return NextResponse.json({
            integrations: integrations.map(i => ({ provider: i.provider, isActive: i.isActive }))
        })
    } catch (error) {
        console.error("Error fetching integrations:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
