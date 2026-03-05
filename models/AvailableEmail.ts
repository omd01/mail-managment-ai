import mongoose, { Schema, type Document } from "mongoose"

export interface IAvailableEmail extends Document {
  userId: mongoose.Types.ObjectId
  email: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AvailableEmailSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Compound index to ensure email uniqueness per user
AvailableEmailSchema.index({ userId: 1, email: 1 }, { unique: true })

export default mongoose.models.AvailableEmail || mongoose.model<IAvailableEmail>("AvailableEmail", AvailableEmailSchema)
