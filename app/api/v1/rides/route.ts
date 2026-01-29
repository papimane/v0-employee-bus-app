import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

async function getUserFromSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value
  
  if (!sessionToken) return null
  
  const result = await query(
    `SELECT u.* FROM users u
     JOIN sessions s ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [sessionToken]
  )
  
  return result.rows[0] || null
}

/**
 * @swagger
 * /api/v1/rides:
 *   get:
 *     summary: Get all ride requests
 *     tags: [Rides]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, completed, cancelled]
 *         description: Filter by ride status
 *       - in: query
 *         name: passenger_id
 *         schema:
 *           type: string
 *         description: Filter by passenger ID
 *       - in: query
 *         name: driver_id
 *         schema:
 *           type: string
 *         description: Filter by driver ID
 *     responses:
 *       200:
 *         description: List of ride requests
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get("status")
    const passenger_id = searchParams.get("passenger_id")
    const driver_id = searchParams.get("driver_id")

    let sql = `
      SELECT rr.*,
             p.full_name as passenger_name, p.phone as passenger_phone,
             d.full_name as driver_name, d.phone as driver_phone
      FROM ride_requests rr
      LEFT JOIN users p ON rr.passenger_id = p.id
      LEFT JOIN users d ON rr.driver_id = d.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      sql += ` AND rr.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    if (passenger_id) {
      sql += ` AND rr.passenger_id = $${paramIndex}`
      params.push(passenger_id)
      paramIndex++
    }
    if (driver_id) {
      sql += ` AND rr.driver_id = $${paramIndex}`
      params.push(driver_id)
    }

    sql += " ORDER BY rr.created_at DESC"

    const result = await query(sql, params)

    return NextResponse.json({ data: result.rows, count: result.rows.length })
  } catch (error) {
    console.error("Error fetching rides:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/v1/rides:
 *   post:
 *     summary: Create a new ride request
 *     tags: [Rides]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickup_lat
 *               - pickup_lng
 *               - pickup_address
 *             properties:
 *               pickup_lat:
 *                 type: number
 *               pickup_lng:
 *                 type: number
 *               pickup_address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ride request created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { pickup_lat, pickup_lng, pickup_address } = body

    if (!pickup_lat || !pickup_lng || !pickup_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check for existing active request
    const existingResult = await query(
      `SELECT id FROM ride_requests 
       WHERE passenger_id = $1 AND status IN ('pending', 'accepted')`,
      [user.id]
    )

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "You already have an active ride request" },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO ride_requests (passenger_id, pickup_lat, pickup_lng, pickup_address, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [user.id, pickup_lat, pickup_lng, pickup_address]
    )

    return NextResponse.json({ data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating ride:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
