// This is a script you can run to initialize default emails
import { connectToDatabase } from "../lib/db"
import AvailableEmail from "../models/AvailableEmail"

async function initializeEmails() {
  try {
    await connectToDatabase()

    // Default emails
    const defaultEmails = [
      {
        email: "noreply@aimailer.com",
        description: "Automated system notifications",
        isActive: true,
      },
      {
        email: "support@aimailer.com",
        description: "Customer support communications",
        isActive: true,
      },
      {
        email: "info@aimailer.com",
        description: "General information and inquiries",
        isActive: true,
      },
    ]

    // Check if emails already exist
    for (const emailData of defaultEmails) {
      const existingEmail = await AvailableEmail.findOne({ email: emailData.email })

      if (!existingEmail) {
        const newEmail = new AvailableEmail(emailData)
        await newEmail.save()
        console.log(`Added email: ${emailData.email}`)
      } else {
        console.log(`Email already exists: ${emailData.email}`)
      }
    }

    console.log("Default emails initialized successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error initializing emails:", error)
    process.exit(1)
  }
}

initializeEmails()
