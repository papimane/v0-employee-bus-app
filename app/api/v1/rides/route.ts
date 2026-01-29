import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

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
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get("status")
    const passenger_id = searchParams.get("passenger_id")
    const driver_id = searchParams.get("driver_id")

    let query = supabase
      .from("ride_requests")
      .select(`
        *,
        passenger:profiles!ride_requests_passenger_id_fkey(id, first_name, last_name, phone),
        driver:profiles!ride_requests_driver_id_fkey(id, first_name, last_name, phone)
      `)

    if (status) query = query.eq("status", status)
    if (passenger_id) query = query.eq("passenger_id", passenger_id)
    if (driver_id) query = query.eq("driver_id", driver_id)

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data, count: data?.length || 0 })
  } catch (error) {
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
    const supabase = await createClient()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pickup_lat, pickup_lng, pickup_address } = body

    if (!pickup_lat || !pickup_lng || !pickup_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check for existing active request
    const { data: existingRequest } = await supabase
      .from("ride_requests")
      .select("id")
      .eq("passenger_id", user.id)
      .in("status", ["pending", "accepted"])
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have an active ride request" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("ride_requests")
      .insert({
        passenger_id: user.id,
        pickup_lat,
        pickup_lng,
        pickup_address,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
