import { SESClient, SendEmailCommand, SendRawEmailCommand } from "@aws-sdk/client-ses"
import { createMimeMessage } from "mimetext"

interface SESCredentials {
  accessKeyId: string
  secretAccessKey: string
  region: string
}

interface Attachment {
  filename: string
  content: Buffer
  contentType: string
}

interface SendEmailParams {
  from: string
  to: string[]
  subject: string
  html: string
  text?: string
  attachments?: Attachment[]
  credentials?: SESCredentials
}

export async function sendEmail({ from, to, subject, html, text, attachments = [], credentials }: SendEmailParams) {
  try {
    // Use provided credentials or fallback to env vars (for backward compatibility)
    const sesClient = new SESClient({
      region: credentials?.region || process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: credentials?.accessKeyId || process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: credentials?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    })

    console.log("Sending email with SES:", { from, to, subject, attachmentsCount: attachments.length })

    // If there are no attachments, use the simple SendEmailCommand
    if (attachments.length === 0) {
      const command = new SendEmailCommand({
        Source: from,
        Destination: {
          ToAddresses: to,
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: html,
              Charset: "UTF-8",
            },
            ...(text && {
              Text: {
                Data: text,
                Charset: "UTF-8",
              },
            }),
          },
        },
      })

      const response = await sesClient.send(command)
      console.log("Email sent successfully:", response.MessageId)
      return { success: true, messageId: response.MessageId }
    }
    // If there are attachments, use the SendRawEmailCommand with MIME
    else {
      // Create a MIME message
      const msg = createMimeMessage()
      msg.setSender(from)
      to.forEach((recipient) => msg.setRecipient(recipient))
      msg.setSubject(subject)

      // Set HTML content
      msg.addMessage({
        contentType: "text/html",
        data: html,
      })

      // Add plain text if provided
      if (text) {
        msg.addMessage({
          contentType: "text/plain",
          data: text,
        })
      }

      // Add attachments
      attachments.forEach((attachment) => {
        msg.addAttachment({
          filename: attachment.filename,
          contentType: attachment.contentType,
          data: attachment.content.toString("base64"),
        })
      })

      // Send the raw email
      const command = new SendRawEmailCommand({
        RawMessage: {
          Data: Buffer.from(msg.asRaw()),
        },
      })

      const response = await sesClient.send(command)
      console.log("Email with attachments sent successfully:", response.MessageId)
      return { success: true, messageId: response.MessageId }
    }
  } catch (error) {
    console.error("Error sending email with SES:", error)
    return { success: false, error }
  }
}
