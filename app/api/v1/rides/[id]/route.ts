import { createClient } from "@/lib/supabase/server"
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
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from("ride_requests")
      .select(`
        *,
        passenger:profiles!ride_requests_passenger_id_fkey(id, first_name, last_name, phone),
        driver:profiles!ride_requests_driver_id_fkey(id, first_name, last_name, phone)
      `)
      .eq("id", id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
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
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase.from("ride_requests").update(body).eq("id", id).select().single()

    if (error || !data) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
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
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from("ride_requests")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ data, message: "Ride cancelled successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
