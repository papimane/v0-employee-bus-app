"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, Clock, Users, X, AlertCircle } from "lucide-react"
import { Map } from "./map"
import { useState, useEffect } from "react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface HomeMapProps {
  onRequestPickup: () => void
  onOpenProfile: () => void
  userProfile: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
}

function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat1, lng1] = polygon[i]
    const [lat2, lng2] = polygon[j]

    const intersect = lng1 > lng !== lng2 > lng && lat < ((lat2 - lat1) * (lng - lng1)) / (lng2 - lng1) + lat1

    if (intersect) inside = !inside
  }

  return inside
}

const DAKAR_PORT_GEOFENCE: [number, number][] = [
  [14.705, -17.455],
  [14.705, -17.43],
  [14.685, -17.43],
  [14.685, -17.455],
  [14.705, -17.455],
]

export function HomeMap({ onRequestPickup, onOpenProfile, userProfile }: HomeMapProps) {
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation()
  const { toast } = useToast()

  const positionInZone: [number, number] = [14.6937, -17.4441]
  const positionOutZone: [number, number] = [14.705017074264646, -17.45701306060759]

  const [isOutsideZone, setIsOutsideZone] = useState(false)

  const currentPosition: [number, number] =
    latitude !== null && longitude !== null ? [latitude, longitude] : isOutsideZone ? positionOutZone : positionInZone

  const [requestPending, setRequestPending] = useState(false)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)
  const [driverAccepted, setDriverAccepted] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false)
  const [busPosition, setBusPosition] = useState<[number, number] | null>(null)
  const [showGeofenceError, setShowGeofenceError] = useState(false)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)

  const isInGeofence = isPointInPolygon(currentPosition, DAKAR_PORT_GEOFENCE)

  useEffect(() => {
    if (!currentRequestId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`ride_request_${currentRequestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ride_requests",
          filter: `id=eq.${currentRequestId}`,
        },
        (payload) => {
          console.log("[v0] Ride request updated:", payload)
          if (payload.new.status === "accepted") {
            setDriverAccepted(true)
            // Simuler la position du bus (à remplacer par la vraie position du chauffeur)
            setBusPosition([14.7037, -17.4541])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentRequestId])

  const handleRequestPickup = async () => {
    if (isCreatingRequest) return

    if (!isInGeofence && !requestPending) {
      setShowGeofenceError(true)
      setTimeout(() => setShowGeofenceError(false), 3000)
      return
    }

    const supabase = createClient()

    if (requestPending && currentRequestId) {
      setIsCreatingRequest(true)
      try {
        const { error } = await supabase
          .from("ride_requests")
          .update({ status: "cancelled" })
          .eq("id", currentRequestId)

        if (error) throw error

        setRequestPending(false)
        setCurrentRequestId(null)
        setDriverAccepted(false)
        setBusPosition(null)
        setShowToast(false)
      } catch (error) {
        console.error("[v0] Error cancelling request:", error)
        toast({
          title: "Erreur",
          description: "Impossible d'annuler la demande. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsCreatingRequest(false)
      }
    } else {
      setIsCreatingRequest(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        const { data: existingRequests, error: checkError } = await supabase
          .from("ride_requests")
          .select("id, status")
          .eq("passenger_id", user.id)
          .in("status", ["pending", "accepted"])
          .maybeSingle()

        if (checkError) throw checkError

        if (existingRequests) {
          toast({
            title: "Demande en cours",
            description:
              "Vous avez déjà une demande de ramassage en cours. Veuillez l'annuler avant d'en créer une nouvelle.",
            variant: "destructive",
          })
          setIsCreatingRequest(false)
          return
        }

        const { data, error } = await supabase
          .from("ride_requests")
          .insert({
            passenger_id: user.id,
            pickup_latitude: currentPosition[0],
            pickup_longitude: currentPosition[1],
            pickup_address: "Port de Dakar",
            status: "pending",
          })
          .select()
          .single()

        if (error) {
          if (error.code === "23505") {
            toast({
              title: "Demande en cours",
              description: "Vous avez déjà une demande de ramassage en cours.",
              variant: "destructive",
            })
          } else {
            throw error
          }
          setIsCreatingRequest(false)
          return
        }

        console.log("[v0] Ride request created:", data)
        setCurrentRequestId(data.id)
        setRequestPending(true)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      } catch (error) {
        console.error("[v0] Error creating request:", error)
        toast({
          title: "Erreur",
          description: "Impossible de créer la demande. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsCreatingRequest(false)
      }
    }
  }

  const userInitials = userProfile?.first_name?.[0] || userProfile?.last_name?.[0] || "U"
  const userAvatar = userProfile?.avatar_url || "/professional-employee-avatar.jpg"

  const markers = [
    {
      position: currentPosition,
      type: "user" as const,
      label: "Votre position",
      avatar: userAvatar,
    },
  ]

  if (driverAccepted && busPosition) {
    markers.push({
      position: busPosition,
      type: "bus" as const,
      label: "Votre bus arrive",
    })
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-0 px-2 md:px-0">
        <Map center={currentPosition} zoom={13} markers={markers} showGeofence={true} />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-card shadow-lg">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="bg-card px-3 py-1.5 rounded-full shadow-lg text-xs flex items-center gap-2">
              {geoLoading ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span>Localisation...</span>
                </>
              ) : geoError ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>GPS désactivé</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>GPS actif</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full shadow-lg">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">Service Actif</span>
          </div>
          <button onClick={onOpenProfile}>
            <Avatar className="h-12 w-12 border-2 border-accent shadow-lg cursor-pointer hover:border-accent/70 transition-colors">
              <AvatarImage src={userAvatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>

      {geoError && (
        <div className="absolute top-24 left-4 right-4 z-20">
          <Card className="p-3 bg-yellow-500/90 backdrop-blur-sm border-yellow-600 shadow-lg">
            <div className="flex items-center gap-2 text-white text-sm">
              <AlertCircle className="h-4 w-4" />
              <p>{geoError}. Position simulée utilisée.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      <div className={`absolute ${geoError ? "top-40" : "top-24"} left-4 right-4 z-10 flex gap-2`}>
        <Card className="flex-1 p-3 bg-card/90 backdrop-blur-sm border-accent/20">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Prochain Bus</p>
              <p className="text-sm font-semibold">5 min</p>
            </div>
          </div>
        </Card>
        <Card className="flex-1 p-3 bg-card/90 backdrop-blur-sm border-accent/20">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Disponible</p>
              <p className="text-sm font-semibold">12 places</p>
            </div>
          </div>
        </Card>
      </div>

      {showGeofenceError && (
        <div className="absolute top-44 left-4 right-4 z-20 animate-in slide-in-from-top-5 fade-in duration-300">
          <Card className="p-4 bg-destructive/90 backdrop-blur-sm border-destructive shadow-lg">
            <div className="flex items-center gap-2 text-white">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Vous êtes en dehors de la zone de ramassage</p>
            </div>
          </Card>
        </div>
      )}

      {showToast && (
        <div className="absolute top-44 left-4 right-4 z-20 animate-in slide-in-from-top-5 fade-in duration-300">
          <Card className="p-4 bg-success/90 backdrop-blur-sm border-success shadow-lg">
            <p className="text-white font-medium text-center">Votre demande est prise en compte</p>
          </Card>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div
          className={`bg-card rounded-t-3xl shadow-2xl transition-all duration-300 ease-in-out ${
            isSheetCollapsed ? "pb-6 pt-4" : "p-6"
          }`}
        >
          <button onClick={() => setIsSheetCollapsed(!isSheetCollapsed)} className="w-full flex justify-center mb-2">
            <div className="w-12 h-1 bg-border rounded-full" />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isSheetCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
            }`}
          >
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-balance">Où allez-vous ?</h2>
                <p className="text-muted-foreground text-pretty">
                  Demandez un ramassage et nous vous mettrons en relation avec le bus le plus proche
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleRequestPickup}
            disabled={isCreatingRequest}
            size="lg"
            className={`w-full h-14 text-lg font-semibold shadow-lg transition-all duration-300 ${
              requestPending
                ? "bg-black hover:bg-black/90 text-white"
                : "bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent/20"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isCreatingRequest ? (
              <span className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {requestPending ? "Annulation..." : "Création..."}
              </span>
            ) : requestPending ? (
              <span className="flex items-center gap-2">
                <X className="h-5 w-5" />
                Annuler ma demande
              </span>
            ) : (
              "Demander un Ramassage"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
