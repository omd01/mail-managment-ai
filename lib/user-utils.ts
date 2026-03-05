import mongoose from "mongoose"
import User from "@/models/User"
import AvailableEmail from "@/models/AvailableEmail"
import Template from "@/models/Template"

export async function initializeUserData(userId: string) {
  try {
    // Convert string ID to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId)

    // Initialize default available emails
    const defaultEmails = [
      {
        userId: userObjectId,
        email: "noreply@aimailer.com",
        description: "Automated system notifications",
        isActive: true,
      },
      {
        userId: userObjectId,
        email: "support@aimailer.com",
        description: "Customer support communications",
        isActive: true,
      },
      {
        userId: userObjectId,
        email: "info@aimailer.com",
        description: "General information and inquiries",
        isActive: true,
      },
    ]

    // Create default emails
    await AvailableEmail.insertMany(defaultEmails)

    // Create a default welcome template
    const welcomeTemplate = {
      userId: userObjectId,
      name: "Welcome Email",
      description: "A simple welcome email template for new users",
      subject: "Welcome to {{company}}!",
      content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #333;">Hello {{name}}</h1>
  <p>Welcome to {{company}}!</p>
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p>Your account has been created successfully.</p>
  </div>
  <p>Best regards,<br/>The {{company}} Team</p>
</div>
      `,
      variables: ["name", "company"],
      templateType: "html",
      attachments: [],
      usageCount: 0,
    }

    await Template.create(welcomeTemplate)

    // Mark user as initialized
    await User.findByIdAndUpdate(userObjectId, { isOnboarded: true })

    return { success: true }
  } catch (error) {
    console.error("Error initializing user data:", error)
    return { success: false, error }
  }
}
