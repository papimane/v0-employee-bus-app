"use server"

import { createAdminClient } from "@/lib/supabase/server"

export async function acceptRideRequest(requestId: string, driverId: string) {
  try {
    const supabase = await createAdminClient()

    const { error } = await supabase.rpc("accept_ride_request", {
      p_request_id: requestId,
      p_driver_id: driverId,
    })

    if (error) {
      console.error("[v0] Error accepting request:", error)
      throw error
    }

    console.log("[v0] Request accepted successfully:", requestId)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in acceptRideRequest:", error)
    return { success: false, error: String(error) }
  }
}
