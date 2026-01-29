import { createClient } from "@/lib/supabase/server"
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
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "passenger")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data, count: data?.length || 0 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
