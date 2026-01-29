import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

/**
 * @swagger
 * /api/v1/drivers:
 *   get:
 *     summary: Get all drivers
 *     tags: [Drivers]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of drivers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active")

    let sql = `
      SELECT d.*, u.full_name as user_full_name, u.phone as user_phone, u.avatar_url as user_avatar
      FROM drivers d
      LEFT JOIN users u ON d.user_id = u.id
    `
    const params: any[] = []

    if (active !== null) {
      sql += " WHERE d.is_active = $1"
      params.push(active === "true")
    }

    sql += " ORDER BY d.created_at DESC"

    const result = await query(sql, params)

    return NextResponse.json({ data: result.rows, count: result.rows.length })
  } catch (error) {
    console.error("Error fetching drivers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
