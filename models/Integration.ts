import mongoose from "mongoose"

const IntegrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    provider: {
        type: String,
        enum: ["aws", "resend"],
        required: true,
    },
    credentials: {
        // For AWS: accessKeyId, secretAccessKey, region
        // For Resend: apiKey
        type: Object,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

// Prevent duplicate active integrations for the same provider per user (optional, but good for now)
IntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true })

export default mongoose.models.Integration || mongoose.model("Integration", IntegrationSchema)
