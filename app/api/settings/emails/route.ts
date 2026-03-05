import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import AvailableEmail from "@/models/AvailableEmail"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth-utils"

// Get all available emails
export async function GET() {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()
    const emails = await AvailableEmail.find({ userId: user.id }).sort({ createdAt: -1 })

    return NextResponse.json(emails)
  } catch (error) {
    console.error("Error fetching available emails:", error)
    return NextResponse.json({ error: "Failed to fetch available emails" }, { status: 500 })
  }
}

// Add a new available email
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { email, description } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if email already exists for this user
    const existingEmail = await AvailableEmail.findOne({
      userId: user.id,
      email: email.toLowerCase(),
    })

    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    const newEmail = new AvailableEmail({
      userId: user.id,
      email: email.toLowerCase(),
      description: description || "",
      isActive: true,
    })

    await newEmail.save()

    // Revalidate paths that might use this data
    revalidatePath("/settings")
    revalidatePath("/send")
    revalidatePath("/dashboard")

    return NextResponse.json(newEmail, { status: 201 })
  } catch (error) {
    console.error("Error adding available email:", error)
    return NextResponse.json({ error: "Failed to add available email" }, { status: 500 })
  }
}
