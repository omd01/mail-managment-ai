import mongoose from "mongoose"
import EmailLog from "@/models/EmailLog"
import Template from "@/models/Template"
import AvailableEmail from "@/models/AvailableEmail"

// Seeds a realistic set of historical EmailLog records for a user the first
// time their dashboard is opened, so analytics and charts are populated for the
// demo. Real sends from the Send / Bulk pages add to this same collection, so
// the numbers stay consistent and keep growing.

const SUBJECTS = [
  "Welcome to our platform!",
  "Your monthly newsletter is here",
  "Special offer just for you",
  "Action required: confirm your email",
  "Product update — what's new this month",
  "Thanks for signing up",
  "Your weekly digest",
  "We miss you — come back!",
  "Invoice for your subscription",
  "New features you'll love",
  "Limited-time discount inside",
  "Tips to get the most out of your account",
]

const DEFAULT_SENDERS = ["noreply@aimailer.com", "support@aimailer.com", "info@aimailer.com"]

// Weighted status distribution — a single record carries one final status.
// Delivered > Opened keeps the cards looking sensible (delivered ≥ opened).
function pickStatus(): "delivered" | "opened" | "bounced" | "sent" {
  const r = Math.random()
  if (r < 0.55) return "delivered"
  if (r < 0.83) return "opened"
  if (r < 0.92) return "sent"
  return "bounced"
}

function randomEmail(i: number) {
  const names = ["alex", "sam", "jordan", "taylor", "riya", "arjun", "priya", "rahul", "neha", "vikram"]
  const domains = ["gmail.com", "outlook.com", "company.com", "startup.io", "example.com"]
  return `${names[i % names.length]}${(i % 97) + 1}@${domains[i % domains.length]}`
}

export async function seedDemoEmailLogsIfEmpty(userId: string): Promise<number> {
  const userObjectId = new mongoose.Types.ObjectId(userId)

  const existing = await EmailLog.countDocuments({ userId: userObjectId })
  if (existing > 0) return 0

  // Use the user's real sending identities if they exist, else defaults.
  const identities = await AvailableEmail.find({ userId: userObjectId }).select("email").lean()
  const senders = identities.length > 0 ? identities.map((d: any) => d.email) : DEFAULT_SENDERS

  // Link some records to the user's templates if any exist.
  const templates = await Template.find({ userId: userObjectId }).select("_id").lean()
  const templateIds = templates.map((t: any) => t._id)

  const now = Date.now()
  const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 180
  const total = 160

  const docs = Array.from({ length: total }).map((_, i) => {
    const createdAt = new Date(now - Math.floor(Math.random() * SIX_MONTHS_MS))
    const status = pickStatus()
    return {
      userId: userObjectId,
      from: senders[i % senders.length],
      to: [randomEmail(i)],
      subject: SUBJECTS[i % SUBJECTS.length],
      templateId: templateIds.length > 0 && Math.random() < 0.6 ? templateIds[i % templateIds.length] : undefined,
      status,
      messageId: `seed-${i}-${createdAt.getTime()}`,
      hasAttachments: Math.random() < 0.2,
      createdAt,
      updatedAt: createdAt,
    }
  })

  await EmailLog.insertMany(docs)
  return docs.length
}
