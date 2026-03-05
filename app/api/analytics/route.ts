import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import EmailLog from "@/models/EmailLog"
import Template from "@/models/Template"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth-utils"
import mongoose from "mongoose"

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300

// Helper to get cache headers
function getCacheHeaders() {
  return {
    "Cache-Control": `s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
  }
}

export async function GET() {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    await connectToDatabase()

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
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
