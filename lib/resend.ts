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
    apiKey: string
}

export async function sendEmailResend({ from, to, subject, html, text, attachments = [], apiKey }: SendEmailParams) {
    try {
        console.log("Sending email with Resend:", { from, to, subject, attachmentsCount: attachments.length })

        const resendAttachments = attachments.map(att => ({
            filename: att.filename,
            content: att.content, // Resend node SDK takes buffer, but API takes base64? checking docs.. API expects buffer in SDK, but raw HTTP needs handling.
            // Actually, for raw HTTP to Resend, we should check their API refs. 
            // Docs: https://resend.com/docs/api-reference/emails/send-email
            // attachments: array of objects with filename and content (buffer or base64 string)
        }))

        // Convert buffers to base64 for JSON payload
        const processedAttachments = attachments.map(att => ({
            filename: att.filename,
            content: att.content.toString('base64'),
        }))

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                from,
                to,
                subject,
                html,
                text,
                attachments: processedAttachments,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error("Resend API error:", data)
            throw new Error(data.message || "Failed to send with Resend")
        }

        console.log("Email sent successfully with Resend:", data.id)
        return { success: true, messageId: data.id }

    } catch (error) {
        console.error("Error sending email with Resend:", error)
        return { success: false, error }
    }
}
