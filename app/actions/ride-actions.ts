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

export async function cancelRideRequest(requestId: string, userId: string) {
  try {
    const supabase = await createAdminClient()

    // Vérifier que la demande appartient bien à l'utilisateur
    const { data: request, error: fetchError } = await supabase
      .from("ride_requests")
      .select("passenger_id")
      .eq("id", requestId)
      .single()

    if (fetchError) {
      console.error("[v0] Error fetching request:", fetchError)
      throw fetchError
    }

    if (request.passenger_id !== userId) {
      throw new Error("Unauthorized: You can only cancel your own requests")
    }

    // Annuler la demande
    const { error } = await supabase.from("ride_requests").update({ status: "cancelled" }).eq("id", requestId)

    if (error) {
      console.error("[v0] Error cancelling request:", error)
      throw error
    }

    console.log("[v0] Request cancelled successfully:", requestId)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in cancelRideRequest:", error)
    return { success: false, error: String(error) }
  }
}
