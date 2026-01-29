"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Phone, User, Clock, ArrowLeft } from "lucide-react"
import { Map } from "./map"
import { createClient } from "@/lib/supabase/client"
import { acceptRideRequest } from "@/app/actions/ride-actions"

interface Passenger {
  id: string
  name: string
  position: [number, number]
  address: string
  waitTime: number
  avatar?: string
  requestId: string
}

interface DriverViewProps {
  onBack: () => void
  onOpenProfile: () => void
}

export function DriverView({ onBack, onOpenProfile }: DriverViewProps) {
  const driverPosition: [number, number] = [14.68, -17.45]

  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null)
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const loadPendingRequests = async () => {
      try {
        console.log("[v0] Loading pending requests...")
        const { data: requests, error } = await supabase
          .from("ride_requests")
          .select(
            `
            id,
            pickup_latitude,
            pickup_longitude,
            pickup_address,
            created_at,
            passenger_id,
            profiles:passenger_id (
              first_name,
              last_name,
              avatar_url
            )
          `,
          )
          .eq("status", "pending")
          .order("created_at", { ascending: true })

        if (error) {
          console.error("[v0] Error loading requests:", error)
          throw error
        }

        console.log("[v0] Loaded pending requests:", requests)

        const formattedPassengers: Passenger[] = requests.map((req: any) => {
          const profile = req.profiles
          const waitTime = Math.floor((Date.now() - new Date(req.created_at).getTime()) / 60000)

          return {
            id: req.passenger_id,
            requestId: req.id,
            name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Passager",
            position: [req.pickup_latitude, req.pickup_longitude] as [number, number],
            address: req.pickup_address || "Adresse inconnue",
            waitTime: waitTime,
            avatar: profile?.avatar_url || "/professional-employee.png",
          }
        })

        setPassengers(formattedPassengers)
      } catch (error) {
        console.error("[v0] Error loading requests:", error)
      }
    }

    loadPendingRequests()

    const channel = supabase
      .channel("ride_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ride_requests",
        },
        (payload) => {
          console.log("[v0] Ride requests changed:", payload)
          loadPendingRequests()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const route = selectedPassenger ? [driverPosition, selectedPassenger.position] : undefined

  const markers = [
    {
      position: driverPosition,
      type: "bus" as const,
      label: "Votre position",
    },
    ...passengers.map((p) => ({
      position: p.position,
      type: "user" as const,
      label: p.name,
      avatar: p.avatar,
    })),
  ]

  const handleSelectPassenger = (passenger: Passenger) => {
    setSelectedPassenger(passenger)
  }

  const handleStartNavigation = async () => {
    if (!selectedPassenger || isAccepting) return

    setIsAccepting(true)
    const supabase = createClient()

    try {
      console.log("[v0] Accepting request:", selectedPassenger.requestId)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const result = await acceptRideRequest(selectedPassenger.requestId, user.id)

      if (!result.success) {
        throw new Error(result.error || "Failed to accept request")
      }

      console.log("[v0] Request accepted successfully:", selectedPassenger.requestId)

      const url = `https://www.google.com/maps/dir/?api=1&origin=${driverPosition[0]},${driverPosition[1]}&destination=${selectedPassenger.position[0]},${selectedPassenger.position[1]}`
      window.open(url, "_blank")

      setSelectedPassenger(null)
    } catch (error) {
      console.error("[v0] Error accepting request:", error)
      alert("Erreur lors de l'acceptation de la demande. Veuillez réessayer.")
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="flex-1 relative z-0 px-2 md:px-0">
        <Map center={driverPosition} zoom={13} markers={markers} route={route} showGeofence={true} />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-card shadow-lg" onClick={onBack}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full shadow-lg">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">En Service</span>
          </div>
          <button onClick={onOpenProfile}>
            <Avatar className="h-12 w-12 border-2 border-accent shadow-lg cursor-pointer hover:border-accent/70 transition-colors">
              <AvatarImage src="/professional-bus-driver.png" />
              <AvatarFallback className="bg-primary text-primary-foreground">CH</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>

      {/* Passengers List */}
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Demandes en Attente</h2>
                <Badge className="bg-accent text-accent-foreground">{passengers.length}</Badge>
              </div>

              {passengers.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">Aucune demande en attente pour le moment</p>
                  <p className="text-xs text-muted-foreground mt-2">Les demandes apparaîtront ici automatiquement</p>
                </Card>
              ) : (
                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                  {passengers.map((passenger) => (
                    <Card
                      key={passenger.requestId}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedPassenger?.requestId === passenger.requestId ? "border-accent border-2 bg-accent/5" : ""
                      }`}
                      onClick={() => handleSelectPassenger(passenger)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 border-2 border-muted">
                          <AvatarImage src={passenger.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold truncate">{passenger.name}</p>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {passenger.waitTime} min
                            </Badge>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground line-clamp-2">{passenger.address}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="flex-shrink-0">
                          <Phone className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedPassenger && (
            <div className={`space-y-3 ${isSheetCollapsed ? "" : "pt-4 border-t mt-4"}`}>
              {!isSheetCollapsed && (
                <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Passager Sélectionné</p>
                    <p className="font-semibold">{selectedPassenger.name}</p>
                  </div>
                </div>
              )}
              <Button
                size="lg"
                className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg disabled:opacity-50"
                onClick={handleStartNavigation}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Acceptation...
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5 mr-2" />
                    Accepter et Démarrer
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
