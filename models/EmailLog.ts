import mongoose, { Schema, type Document } from "mongoose"

export interface IEmailLog extends Document {
  userId: mongoose.Types.ObjectId
  from: string
  to: string[]
  subject: string
  templateId?: mongoose.Types.ObjectId
  status: "sent" | "delivered" | "bounced" | "opened"
  messageId?: string
  hasAttachments?: boolean
  createdAt: Date
  updatedAt: Date
}

const EmailLogSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: { type: String, required: true },
    to: [{ type: String, required: true }],
    subject: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: "Template" },
    status: {
      type: String,
      enum: ["sent", "delivered", "bounced", "opened"],
      default: "sent",
    },
    messageId: { type: String },
    hasAttachments: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.models.EmailLog || mongoose.model<IEmailLog>("EmailLog", EmailLogSchema)
