import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/aws-ses"
import { sendEmailResend } from "@/lib/resend"
import { connectToDatabase } from "@/lib/db"
import EmailLog from "@/models/EmailLog"
import Template from "@/models/Template"
import Integration from "@/models/Integration"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check content type to determine how to parse the request
    const contentType = request.headers.get("content-type") || ""

    let from: string
    let to: string
    let subject: string
    let html: string
    let templateId: string | null = null
    let variables: Record<string, string> | null = null
    let attachments: File[] = []
    let attachmentNames: string[] = []
    let staticAttachmentsData: { name: string; url: string }[] = []
    let hasDynamicAttachments: string | null = null
    let preferredProvider: string | null = null

    // Handle JSON requests (from the new UI)
    if (contentType.includes("application/json")) {
      const jsonData = await request.json()
      console.log("Received JSON data:", jsonData)

      from = jsonData.from
      to = jsonData.to
      subject = jsonData.subject
      html = jsonData.html
      templateId = jsonData.templateId || null
      variables = jsonData.variables || null
      hasDynamicAttachments = jsonData.hasDynamicAttachments || null
      preferredProvider = jsonData.provider || null

      // Handle attachments from JSON if present
      if (jsonData.attachments && Array.isArray(jsonData.attachments)) {
        staticAttachmentsData = jsonData.attachments
      }
    }
    // Handle FormData requests (for backward compatibility)
    else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      console.log("Received form data keys:", Array.from(formData.keys()))

      from = formData.get("from") as string
      to = formData.get("to") as string
      subject = formData.get("subject") as string
      html = formData.get("html") as string
      templateId = formData.get("templateId") as string | null
      hasDynamicAttachments = formData.get("hasDynamicAttachments") as string | null
      preferredProvider = formData.get("provider") as string | null

      // Parse variables if present
      const variablesJson = formData.get("variables") as string | null
      if (variablesJson) {
        try {
          variables = JSON.parse(variablesJson)
        } catch (error) {
          console.error("Error parsing variables JSON:", error)
        }
      }

      // Get and process attachments if any
      attachments = formData.getAll("attachments") as File[]
      attachmentNames = formData.getAll("attachmentNames") as string[]

      // Parse static attachments data if present
      const formDataEntries = Array.from(formData.entries())

      for (let i = 0; i < formDataEntries.length; i++) {
        const [key, value] = formDataEntries[i]
        if (key.startsWith("staticAttachments[") && key.endsWith("][name]")) {
          const index = key.match(/\[(\d+)\]/)?.[1]
          if (index) {
            const urlKey = `staticAttachments[${index}][url]`
            const url = formData.get(urlKey) as string
            if (url) {
              staticAttachmentsData.push({
                name: value as string,
                url,
              })
            }
          }
        }
      }
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 })
    }

    // Connect to DB to fetch integrations
    await connectToDatabase()

    // 1. Fetch active integrations
    const integrations = await Integration.find({ userId: user.id, isActive: true })

    if (!integrations || integrations.length === 0) {
      // Fallback to env vars if no DB integrations found (legacy/dev support)
      // Only if env vars exist
      if (!process.env.AWS_ACCESS_KEY_ID) {
        return NextResponse.json({ error: "No active email integrations found. Please configure a provider in Integrations." }, { status: 400 })
      }
    }

    // 2. Select Provider
    let selectedIntegration = null
    if (preferredProvider) {
      selectedIntegration = integrations.find(i => i.provider === preferredProvider)
    }

    // If preferred not found or not specified, defaults:
    if (!selectedIntegration && integrations.length > 0) {
      // Prefer AWS SES, then Resend, then others
      selectedIntegration = integrations.find(i => i.provider === 'aws') || integrations[0]
    }

    const providerName = selectedIntegration ? selectedIntegration.provider : 'aws' // Default to AWS if using env vars fallback
    const credentials = selectedIntegration ? selectedIntegration.credentials : null

    console.log(`Sending email via provider: ${providerName}`)


    // Log received values with more detail
    console.log("Received email data:", {
      from,
      to,
      subject: subject || "(empty)",
      subjectLength: subject?.length || 0,
      subjectValue: JSON.stringify(subject), // Log the exact value for debugging
      htmlLength: html?.length || 0,
      templateId,
      hasVariables: !!variables,
      provider: providerName
    })

    // Validate required fields with detailed error messages
    const missingFields = []
    if (!from) missingFields.push("from")
    if (!to) missingFields.push("to")
    if (!subject) missingFields.push("subject")
    if (!html) missingFields.push("html")

    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(", ")}`)
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    console.log(
      `Processing email with ${attachments.length} file attachments, ${attachmentNames.length} names, and ${staticAttachmentsData.length} static attachments`,
    )

    // Process attachments if any
    const processedAttachments = []

    // Process file attachments (convert File objects to Buffer for internal logic)
    // Note: In Next.js App Router, File extends Blob. lib/aws-ses expects object with content: Buffer.
    if (attachments.length > 0) {
      console.log(`Processing ${attachments.length} file attachments with ${attachmentNames.length} names`)

      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i]
        const buffer = Buffer.from(await file.arrayBuffer())

        // Use the corresponding name from attachmentNames if available
        const filename = i < attachmentNames.length ? attachmentNames[i] : file.name

        console.log(`Adding attachment: ${filename} (${file.type}, ${buffer.length} bytes)`)

        processedAttachments.push({
          filename,
          content: buffer,
          contentType: file.type,
        })
      }
    }

    // Process static attachments (download from URL)
    if (staticAttachmentsData.length > 0) {
      console.log(`Processing ${staticAttachmentsData.length} static attachments`)

      for (const attachment of staticAttachmentsData) {
        try {
          console.log(`Fetching static attachment from ${attachment.url}`)
          const response = await fetch(attachment.url)
          if (!response.ok) {
            console.error(`Failed to fetch attachment from ${attachment.url}`)
            continue
          }

          const buffer = Buffer.from(await response.arrayBuffer())
          const contentType = response.headers.get("content-type") || "application/octet-stream"

          console.log(`Adding static attachment: ${attachment.name} (${contentType}, ${buffer.length} bytes)`)

          processedAttachments.push({
            filename: attachment.name,
            content: buffer,
            contentType,
          })
        } catch (error) {
          console.error(`Error fetching attachment from ${attachment.url}:`, error)
        }
      }
    }

    // Process dynamic attachments from templates
    if (templateId && hasDynamicAttachments === "true") {
      const template = await Template.findOne({
        _id: templateId,
        userId: user.id,
      })

      if (template && template.attachments) {
        const dynamicAttachments = template.attachments.filter((att: any) => att.type === "dynamic")

        for (const attachment of dynamicAttachments) {
          try {
            // Replace variables in the URL if it's a dynamic attachment
            let processedUrl = attachment.url || ""

            if (variables) {
              try {
                const parsedVariables = JSON.parse(variables as string)
                Object.entries(parsedVariables).forEach(([key, value]) => {
                  processedUrl = processedUrl.replace(new RegExp(`{{${key}}}`, "g"), (value as string) || `{{${key}}}`)
                })
              } catch (parseError) {
                console.error("Error parsing variables:", parseError)
              }
            }

            // Fetch the attachment with the processed URL
            const response = await fetch(processedUrl)
            if (!response.ok) {
              console.error(`Failed to fetch dynamic attachment from ${processedUrl}`)
              continue
            }

            const buffer = Buffer.from(await response.arrayBuffer())
            const contentType = response.headers.get("content-type") || "application/octet-stream"

            processedAttachments.push({
              filename: attachment.name,
              content: buffer,
              contentType,
            })
          } catch (error) {
            console.error(`Error processing dynamic attachment:`, error)
          }
        }
      }
    }

    console.log(`Sending email with ${processedAttachments.length} attachments`)

    // Convert comma-separated emails to array
    const toEmails = to.split(",").map((email) => email.trim())

    // 3. Send via selected provider
    let result;

    if (providerName === 'resend') {
      result = await sendEmailResend({
        from,
        to: toEmails,
        subject,
        html,
        text: undefined, // Add text version if you want
        attachments: processedAttachments,
        apiKey: credentials.apiKey
      })
    } else {
      // Default AWS SES
      result = await sendEmail({
        from,
        to: toEmails,
        subject,
        html,
        attachments: processedAttachments,
        credentials, // Pass stored credentials or undefined to use env vars fallback
      })
    }

    if (!result.success) {
      console.error(`${providerName} error:`, result.error)
      return NextResponse.json({ error: "Failed to send email", details: result.error }, { status: 500 })
    }

    // Log email in database
    const emailLog = new EmailLog({
      userId: user.id,
      from,
      to: toEmails, // Store array in DB? Model usually expects array of strings or string
      subject,
      templateId: templateId || undefined,
      status: "sent",
      provider: providerName, // Useful to add this field to EmailLog model eventually
      messageId: result.messageId,
      hasAttachments: processedAttachments.length > 0,
    })

    await emailLog.save()
    revalidatePath("/dashboard")

    // If a template was used, increment its usage count
    if (templateId) {
      await Template.findOneAndUpdate(
        {
          _id: templateId,
          userId: user.id,
        },
        { $inc: { usageCount: 1 } },
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      provider: providerName
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
