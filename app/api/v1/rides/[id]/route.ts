import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

/**
 * @swagger
 * /api/v1/rides/{id}:
 *   get:
 *     summary: Get a specific ride request
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride request details
 *       404:
 *         description: Ride not found
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const result = await query(
      `SELECT rr.*,
              p.full_name as passenger_name, p.phone as passenger_phone,
              d.full_name as driver_name, d.phone as driver_phone
       FROM ride_requests rr
       LEFT JOIN users p ON rr.passenger_id = p.id
       LEFT JOIN users d ON rr.driver_id = d.id
       WHERE rr.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] })
  } catch (error) {
    console.error("Error fetching ride:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/v1/rides/{id}:
 *   patch:
 *     summary: Update a ride request
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, completed, cancelled]
 *               driver_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ride updated
 *       404:
 *         description: Ride not found
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (body.status) {
      fields.push(`status = $${paramIndex}`)
      values.push(body.status)
      paramIndex++
      
      if (body.status === "accepted") {
        fields.push(`accepted_at = NOW()`)
      } else if (body.status === "completed") {
        fields.push(`completed_at = NOW()`)
      } else if (body.status === "cancelled") {
        fields.push(`cancelled_at = NOW()`)
      }
    }
    if (body.driver_id) {
      fields.push(`driver_id = $${paramIndex}`)
      values.push(body.driver_id)
      paramIndex++
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(id)
    const result = await query(
      `UPDATE ride_requests SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0] })
  } catch (error) {
    console.error("Error updating ride:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/v1/rides/{id}:
 *   delete:
 *     summary: Cancel a ride request
 *     tags: [Rides]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ride cancelled
 *       404:
 *         description: Ride not found
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const result = await query(
      `UPDATE ride_requests 
       SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
       WHERE id = $1 
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ data: result.rows[0], message: "Ride cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling ride:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
