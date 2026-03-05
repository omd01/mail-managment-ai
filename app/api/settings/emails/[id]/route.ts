import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import AvailableEmail from "@/models/AvailableEmail"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth-utils"

// Update an available email
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    await connectToDatabase()

    const updatedEmail = await AvailableEmail.findOneAndUpdate(
      {
        _id: id,
        userId: user.id,
      },
      { $set: body },
      { new: true },
    )

    if (!updatedEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    // Revalidate paths that might use this data
    revalidatePath("/settings")
    revalidatePath("/send")
    revalidatePath("/dashboard")
    revalidatePath("/identities")

    return NextResponse.json(updatedEmail)
  } catch (error) {
    console.error("Error updating available email:", error)
    return NextResponse.json({ error: "Failed to update available email" }, { status: 500 })
  }
}

// Delete an available email
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = await params

    await connectToDatabase()

    const deletedEmail = await AvailableEmail.findOneAndDelete({
      _id: id,
      userId: user.id,
    })

    if (!deletedEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    // Revalidate paths that might use this data
    revalidatePath("/settings")
    revalidatePath("/send")
    revalidatePath("/dashboard")
    revalidatePath("/identities")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting available email:", error)
    return NextResponse.json({ error: "Failed to delete available email" }, { status: 500 })
  }
}
