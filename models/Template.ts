import mongoose, { Schema, type Document } from "mongoose"

interface Attachment {
  name: string
  type: "static" | "dynamic"
  url?: string
  description?: string
}

export interface ITemplate extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  description: string
  subject: string
  content: string
  variables: string[]
  templateType: "html" | "react" | "tailwind"
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
  usageCount: number
}

const AttachmentSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["static", "dynamic"], required: true },
  url: { type: String },
  description: { type: String },
})

const TemplateSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    variables: { type: [String], default: [] },
    templateType: {
      type: String,
      enum: ["html", "react", "tailwind"],
      default: "html",
    },
    attachments: { type: [AttachmentSchema], default: [] },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.Template || mongoose.model<ITemplate>("Template", TemplateSchema)
