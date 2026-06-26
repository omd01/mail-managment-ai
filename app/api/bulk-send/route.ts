import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/aws-ses"
import { connectToDatabase } from "@/lib/db"
import EmailLog from "@/models/EmailLog"
import Template from "@/models/Template"
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

    // Handle FormData requests (for attachments)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()

      const from = formData.get("from") as string
      const recipients = JSON.parse(formData.get("recipients") as string)
      const subject = formData.get("subject") as string
      const message = formData.get("message") as string
      const templateId = formData.get("templateId") as string
      const mode = formData.get("mode") as string

      if (!from || !recipients || recipients.length === 0) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      // Get attachments
      const attachments = formData.getAll("attachments") as File[]

      // Parse static attachments
      const staticAttachments: { name: string; url: string }[] = []
      const formDataEntries = Array.from(formData.entries())

      for (let i = 0; i < formDataEntries.length; i++) {
        const [key, value] = formDataEntries[i]
        if (key.startsWith("staticAttachments[") && key.endsWith("][name]")) {
          const index = key.match(/\[(\d+)\]/)?.[1]
          if (index) {
            const urlKey = `staticAttachments[${index}][url]`
            const url = formData.get(urlKey) as string
            if (url) {
              staticAttachments.push({
                name: value as string,
                url,
              })
            }
          }
        }
      }

      const results = []
      let template = null

      // If using a template, fetch it
      if (mode === "template" && templateId && templateId !== "none") {
        await connectToDatabase()
        template = await Template.findOne({
          _id: templateId,
          userId: user.id,
        })

        if (!template) {
          return NextResponse.json({ error: "Template not found" }, { status: 404 })
        }
      }

      // Process each recipient
      for (const recipient of recipients) {
        try {
          // Skip empty email addresses
          if (!recipient.email) continue

          // Prepare email content
          let finalSubject = subject
          let finalMessage = message

          // If using a template, replace variables
          if (mode === "template" && template) {
            // Replace variables in subject
            finalSubject = template.subject
            Object.entries(recipient.variables || {}).forEach(([key, value]) => {
              finalSubject = finalSubject.replace(new RegExp(`{{${key}}}`, "g"), (value as string) || `{{${key}}}`)
            })

            // Replace variables in content
            finalMessage = template.content
            Object.entries(recipient.variables || {}).forEach(([key, value]) => {
              finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, "g"), (value as string) || `{{${key}}}`)
            })
          }

          // Process attachments
          const processedAttachments = []

          // Process file attachments
          if (attachments.length > 0) {
            for (const file of attachments) {
              const buffer = Buffer.from(await file.arrayBuffer())
              processedAttachments.push({
                filename: file.name,
                content: buffer,
                contentType: file.type,
              })
            }
          }

          // Process static attachments
          if (staticAttachments.length > 0) {
            for (const attachment of staticAttachments) {
              try {
                const response = await fetch(attachment.url)
                if (!response.ok) {
                  console.error(`Failed to fetch attachment from ${attachment.url}`)
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
                console.error(`Error fetching attachment from ${attachment.url}:`, error)
              }
            }
          }

          // Send the email
          const result = await sendEmail({
            from,
            to: [recipient.email],
            subject: finalSubject,
            html: finalMessage,
            attachments: processedAttachments,
          })

          // Don't record a failed send as successful.
          if (!result.success) {
            console.error(`Failed to send email to ${recipient.email}:`, result.error)
            results.push({
              email: recipient.email,
              success: false,
              error: result.error instanceof Error ? result.error.message : "Failed to send email",
            })
            continue
          }

          // Log the email
          await connectToDatabase()
          const emailLog = new EmailLog({
            userId: user.id,
            from,
            to: [recipient.email],
            subject: finalSubject,
            templateId: template?._id,
            status: "sent",
            messageId: result.messageId,
            hasAttachments: processedAttachments.length > 0,
          })

          await emailLog.save()

          // If a template was used, increment its usage count
          if (template) {
            await Template.findByIdAndUpdate(template._id, { $inc: { usageCount: 1 } })
          }

          results.push({
            email: recipient.email,
            success: true,
            messageId: result.messageId,
          })
        } catch (error) {
          console.error(`Error sending email to ${recipient.email}:`, error)
          results.push({
            email: recipient.email,
            success: false,
            error: error instanceof Error ? error.message : "Failed to send email",
          })
        }
      }

      // Revalidate dashboard to update stats
      revalidatePath("/dashboard")

      return NextResponse.json({
        success: true,
        results,
      })
    } else {
      // Handle JSON requests
      const { from, recipients, subject, message, templateId, mode } = await request.json()

      if (!from || !recipients || recipients.length === 0) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const results = []
      let template = null

      // If using a template, fetch it
      if (mode === "template" && templateId && templateId !== "none") {
        await connectToDatabase()
        template = await Template.findOne({
          _id: templateId,
          userId: user.id,
        })

        if (!template) {
          return NextResponse.json({ error: "Template not found" }, { status: 404 })
        }
      }

      // Process each recipient
      for (const recipient of recipients) {
        try {
          // Skip empty email addresses
          if (!recipient.email) continue

          // Prepare email content
          let finalSubject = subject
          let finalMessage = message

          // If using a template, replace variables
          if (mode === "template" && template) {
            // Replace variables in subject
            finalSubject = template.subject
            Object.entries(recipient.variables || {}).forEach(([key, value]) => {
              finalSubject = finalSubject.replace(new RegExp(`{{${key}}}`, "g"), (value as string) || `{{${key}}}`)
            })

            // Replace variables in content
            finalMessage = template.content
            Object.entries(recipient.variables || {}).forEach(([key, value]) => {
              finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, "g"), (value as string) || `{{${key}}}`)
            })
          }

          // Send the email
          const result = await sendEmail({
            from,
            to: [recipient.email],
            subject: finalSubject,
            html: finalMessage,
          })

          // Don't record a failed send as successful.
          if (!result.success) {
            console.error(`Failed to send email to ${recipient.email}:`, result.error)
            results.push({
              email: recipient.email,
              success: false,
              error: result.error instanceof Error ? result.error.message : "Failed to send email",
            })
            continue
          }

          // Log the email
          await connectToDatabase()
          const emailLog = new EmailLog({
            userId: user.id,
            from,
            to: [recipient.email],
            subject: finalSubject,
            templateId: template?._id,
            status: "sent",
            messageId: result.messageId,
          })

          await emailLog.save()

          // If a template was used, increment its usage count
          if (template) {
            await Template.findByIdAndUpdate(template._id, { $inc: { usageCount: 1 } })
          }

          results.push({
            email: recipient.email,
            success: true,
            messageId: result.messageId,
          })
        } catch (error) {
          console.error(`Error sending email to ${recipient.email}:`, error)
          results.push({
            email: recipient.email,
            success: false,
            error: error instanceof Error ? error.message : "Failed to send email",
          })
        }
      }

      // Revalidate dashboard to update stats
      revalidatePath("/dashboard")

      return NextResponse.json({
        success: true,
        results,
      })
    }
  } catch (error) {
    console.error("Error in bulk send:", error)
    return NextResponse.json(
      {
        error: "Failed to process bulk email request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
