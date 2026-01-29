import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

/**
 * @swagger
 * /api/v1/passengers:
 *   get:
 *     summary: Get all passengers
 *     tags: [Passengers]
 *     responses:
 *       200:
 *         description: List of passengers
 */
export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT id, email, full_name, phone, avatar_url, role, created_at 
       FROM users 
       WHERE role = 'passenger' 
       ORDER BY created_at DESC`
    )

    return NextResponse.json({ data: result.rows, count: result.rows.length })
  } catch (error) {
    console.error("Error fetching passengers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
