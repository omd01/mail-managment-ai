import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  email: string
  name?: string
  profileImage?: string
  authProvider: "email" | "google"
  awsRegion: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
  domain?: string
  domainVerified?: boolean
  isOnboarded: boolean
  otp?: string
  otpExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    profileImage: { type: String },
    authProvider: { type: String, enum: ["email", "google"], default: "email" },
    awsRegion: { type: String },
    awsAccessKeyId: { type: String },
    awsSecretAccessKey: { type: String },
    domain: { type: String },
    domainVerified: { type: Boolean, default: false },
    isOnboarded: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
