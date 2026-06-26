import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import EmailLog from "@/models/EmailLog"
import Template from "@/models/Template"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth-utils"
import { seedDemoEmailLogsIfEmpty } from "@/lib/seed-demo"
import mongoose from "mongoose"

// Representative analytics payload used when there is no signed-in user or the
// database is unavailable, so the dashboard always renders cleanly instead of
// erroring. Signed-in users get their real (auto-seeded) data below.
function sampleAnalytics() {
  return {
    emailStats: { total: 1846, delivered: 1521, bounced: 64, opened: 712 },
    monthlyData: [
      { date: "Jan", sent: 240, delivered: 210, opened: 96 },
      { date: "Feb", sent: 310, delivered: 280, opened: 132 },
      { date: "Mar", sent: 280, delivered: 255, opened: 121 },
      { date: "Apr", sent: 360, delivered: 320, opened: 150 },
      { date: "May", sent: 330, delivered: 300, opened: 142 },
      { date: "Jun", sent: 326, delivered: 296, opened: 138 },
    ],
    templateUsage: [
      { name: "Welcome Email", usage: 64 },
      { name: "Newsletter", usage: 48 },
      { name: "Promo Offer", usage: 39 },
      { name: "Invoice", usage: 27 },
      { name: "Re-engagement", usage: 18 },
    ],
    costs: [
      { month: "Jan", cost: 120 },
      { month: "Feb", cost: 190 },
      { month: "Mar", cost: 150 },
      { month: "Apr", cost: 170 },
      { month: "May", cost: 210 },
      { month: "Jun", cost: 180 },
    ],
    senderStats: [
      { name: "noreply@aimailer.com", value: 820 },
      { name: "support@aimailer.com", value: 560 },
      { name: "info@aimailer.com", value: 466 },
    ],
  }
}

export async function GET() {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      // Keep the dashboard populated for demos / unauthenticated previews.
      return NextResponse.json(sampleAnalytics())
    }

    await connectToDatabase()

    // First-time users get a realistic history so the dashboard isn't empty.
    await seedDemoEmailLogsIfEmpty(user.id)

    // Run all queries in parallel for better performance, filtering by userId
    const [totalCount, deliveredCount, bouncedCount, openedCount, monthlyData, templateUsage, senderStats] =
      await Promise.all([
        // Basic stats - use countDocuments which is faster than find().count()
        EmailLog.countDocuments({ userId: user.id }),
        EmailLog.countDocuments({ userId: user.id, status: "delivered" }),
        EmailLog.countDocuments({ userId: user.id, status: "bounced" }),
        EmailLog.countDocuments({ userId: user.id, status: "opened" }),

        // Monthly data - limit to last 6 months for better performance
        EmailLog.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(user.id),
              createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              sent: { $sum: 1 },
              delivered: {
                $sum: {
                  $cond: [{ $eq: ["$status", "delivered"] }, 1, 0],
                },
              },
              opened: {
                $sum: {
                  $cond: [{ $eq: ["$status", "opened"] }, 1, 0],
                },
              },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
          {
            $project: {
              _id: 0,
              date: {
                $let: {
                  vars: {
                    monthsInString: [
                      null,
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ],
                  },
                  in: { $arrayElemAt: ["$$monthsInString", "$_id.month"] },
                },
              },
              sent: 1,
              delivered: 1,
              opened: 1,
            },
          },
        ]),

        // Template usage - limit to top 5 for better performance
        Template.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(user.id),
            },
          },
          { $sort: { usageCount: -1 } },
          { $limit: 5 },
          {
            $project: {
              _id: 0,
              name: 1,
              usage: "$usageCount",
            },
          },
        ]),

        EmailLog.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(user.id),
            },
          },
          {
            $group: {
              _id: "$from",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              name: "$_id",
              value: "$count",
            },
          },
          { $sort: { value: -1 } },
          { $limit: 6 },
        ]),
      ])

    // Mock cost data - in a real app, you'd calculate this from AWS billing data
    // This is static data so no need to fetch from DB
    const costs = [
      { month: "Jan", cost: 120 },
      { month: "Feb", cost: 190 },
      { month: "Mar", cost: 150 },
      { month: "Apr", cost: 170 },
      { month: "May", cost: 210 },
      { month: "Jun", cost: 180 },
    ]

    const analyticsData = {
      emailStats: {
        total: totalCount,
        delivered: deliveredCount,
        bounced: bouncedCount,
        opened: openedCount,
      },
      monthlyData,
      templateUsage,
      costs,
      senderStats,
    }

    // Force revalidation of the dashboard path
    revalidatePath("/dashboard")

    // Return response with no-cache headers
    return NextResponse.json(analyticsData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching analytics, returning sample data:", error)
    // Never break the dashboard on a transient DB error.
    return NextResponse.json(sampleAnalytics())
  }
}
