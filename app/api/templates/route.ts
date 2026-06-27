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

// Add more detailed logging in the GET endpoint to debug template data
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()

    // Include content for preview but limit its size, filter by userId
    const templates = await Template.find(
      { userId: user.id },
      {
        name: 1,
        description: 1,
        subject: 1, // Include subject for listings
        content: 1, // Include content for preview
        templateType: 1, // Include template type for styling
        createdAt: 1,
        updatedAt: 1,
        usageCount: 1,
        variables: 1, // Ensure variables are included
        attachments: 1, // Ensure attachments are included
      },
    )
      .sort({ updatedAt: -1 })
      .limit(20) // Limit to 20 most recent templates for better performance

    // Process templates to limit content size for preview
    const processedTemplates = templates.map((template) => {
      const templateObj = template.toObject()

      // Limit content size to reduce payload
      if (templateObj.content && templateObj.content.length > 1000) {
        templateObj.content = templateObj.content.substring(0, 1000)
      }

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

      return templateObj
    })

    console.log(`Returning ${processedTemplates.length} templates with variables and attachments for user ${user.id}`)

    // Log a sample template for debugging
    if (processedTemplates.length > 0) {
      const sample = processedTemplates[0]
      console.log("Sample template:", {
        id: sample._id,
        name: sample.name,
        hasVariables: Boolean(sample.variables && sample.variables.length > 0),
        variablesCount: sample.variables ? sample.variables.length : 0,
        hasAttachments: Boolean(sample.attachments && sample.attachments.length > 0),
        attachmentsCount: sample.attachments ? sample.attachments.length : 0,
      })
    }

    // Aggressively revalidate all related paths
    revalidatePath("/", "layout")
    revalidatePath("/templates", "layout")
    revalidatePath("/send", "layout")

    // Return response with no-cache headers
    return NextResponse.json(processedTemplates, {
      headers: NO_CACHE_HEADERS,
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, subject, content, variables = [], templateType = "html", attachments = [] } = body

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
    const template = new Template({
      userId: user.id,
      name,
      description,
      subject,
      content,
      variables,
      templateType,
      attachments,
    })

    await template.save()

    // Aggressively revalidate all related paths
    revalidatePath("/", "layout")
    revalidatePath("/templates", "layout")
    revalidatePath("/send", "layout")

    return NextResponse.json(template, {
      headers: NO_CACHE_HEADERS,
    })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { error: "Failed to create template" },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      },
    )
  }
}
