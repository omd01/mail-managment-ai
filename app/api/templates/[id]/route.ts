import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Template from "@/models/Template"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth-utils"

// No-cache headers
const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()
    const template = await Template.findOne({
      _id: id,
      userId: user.id,
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        {
          status: 404,
          headers: NO_CACHE_HEADERS,
        },
      )
    }

    // Convert to plain object
    const templateObj = template.toObject()

    // Ensure variables is always an array
    if (!templateObj.variables) {
      templateObj.variables = []
    } else if (!Array.isArray(templateObj.variables)) {
      console.error(`Template ${templateObj._id} has variables that is not an array:`, templateObj.variables)
      templateObj.variables = []
    }

    // Ensure attachments is always an array
    if (!templateObj.attachments) {
      templateObj.attachments = []
    } else if (!Array.isArray(templateObj.attachments)) {
      console.error(`Template ${templateObj._id} has attachments that is not an array:`, templateObj.attachments)
      templateObj.attachments = []
    }

    console.log("Returning template by ID:", {
      id: templateObj._id,
      name: templateObj.name,
      hasVariables: Boolean(templateObj.variables && templateObj.variables.length > 0),
      variablesCount: templateObj.variables ? templateObj.variables.length : 0,
      hasAttachments: Boolean(templateObj.attachments && templateObj.attachments.length > 0),
      attachmentsCount: templateObj.attachments ? templateObj.attachments.length : 0,
    })

    // Return response with no-cache headers
    return NextResponse.json(templateObj, {
      headers: NO_CACHE_HEADERS,
    })
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json(
      { error: "Failed to fetch template" },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, subject, content, variables, templateType, attachments } = body

    if (!name || !description || !subject || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        {
          status: 400,
          headers: NO_CACHE_HEADERS,
        },
      )
    }

    await connectToDatabase()
    const template = await Template.findOneAndUpdate(
      {
        _id: id,
        userId: user.id,
      },
      {
        name,
        description,
        subject,
        content,
        variables,
        templateType,
        attachments,
      },
      { new: true },
    )

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        {
          status: 404,
          headers: NO_CACHE_HEADERS,
        },
      )
    }

    // Aggressively revalidate all related paths
    revalidatePath("/", "layout")
    revalidatePath("/templates", "layout")
    revalidatePath(`/templates/${id}`, "layout")
    revalidatePath("/send", "layout")

    return NextResponse.json(template, {
      headers: NO_CACHE_HEADERS,
    })
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Failed to update template" },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()
    const template = await Template.findOneAndDelete({
      _id: id,
      userId: user.id,
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        {
          status: 404,
          headers: NO_CACHE_HEADERS,
        },
      )
    }

    // Aggressively revalidate all related paths
    revalidatePath("/", "layout")
    revalidatePath("/templates", "layout")
    revalidatePath(`/templates/${id}`, "layout")
    revalidatePath("/send", "layout")

    return NextResponse.json(
      { success: true },
      {
        headers: NO_CACHE_HEADERS,
      },
    )
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: "Failed to delete template" },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      },
    )
  }
}
