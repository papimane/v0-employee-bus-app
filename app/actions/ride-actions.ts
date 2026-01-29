"use server"

import { query, rideRequestRepository } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function createRideRequest(pickupLat: number, pickupLng: number, pickupAddress: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Non authentifié" }
    }

    // Vérifier s'il existe déjà une demande en cours
    const existingRequests = await rideRequestRepository.findByPassengerId(user.id, ["pending", "accepted"])
    if (existingRequests.length > 0) {
      return { 
        success: false, 
        error: "Vous avez déjà une demande en cours",
        existingRequest: existingRequests[0]
      }
    }

    const request = await rideRequestRepository.create({
      passenger_id: user.id,
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      pickup_address: pickupAddress,
    })

    return { success: true, request }
  } catch (error) {
    console.error("[Ride] Error creating request:", error)
    return { success: false, error: String(error) }
  }
}

export async function acceptRideRequest(requestId: string, driverId: string) {
  try {
    const request = await rideRequestRepository.accept(requestId, driverId)
    
    if (!request) {
      return { success: false, error: "Demande non trouvée ou déjà acceptée" }
    }

    return { success: true, request }
  } catch (error) {
    console.error("[Ride] Error accepting request:", error)
    return { success: false, error: String(error) }
  }
}

export async function cancelRideRequest(requestId: string, userId: string) {
  try {
    const request = await rideRequestRepository.cancel(requestId, userId)
    
    if (!request) {
      return { success: false, error: "Demande non trouvée ou vous n'êtes pas autorisé à l'annuler" }
    }

    return { success: true }
  } catch (error) {
    console.error("[Ride] Error cancelling request:", error)
    return { success: false, error: String(error) }
  }
}

export async function completeRideRequest(requestId: string) {
  try {
    const request = await rideRequestRepository.complete(requestId)
    
    if (!request) {
      return { success: false, error: "Demande non trouvée" }
    }

    return { success: true }
  } catch (error) {
    console.error("[Ride] Error completing request:", error)
    return { success: false, error: String(error) }
  }
}

export async function getPendingRequests() {
  try {
    const requests = await rideRequestRepository.findPending()
    return { success: true, requests }
  } catch (error) {
    console.error("[Ride] Error getting pending requests:", error)
    return { success: false, error: String(error), requests: [] }
  }
}

export async function getUserActiveRequest() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Non authentifié" }
    }

    const requests = await rideRequestRepository.findByPassengerId(user.id, ["pending", "accepted"])
    
    return { 
      success: true, 
      request: requests.length > 0 ? requests[0] : null 
    }
  } catch (error) {
    console.error("[Ride] Error getting user request:", error)
    return { success: false, error: String(error) }
  }
}
