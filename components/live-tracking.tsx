"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bus, MapPin, Phone, MessageSquare, Navigation, Clock, Users, Star, X } from "lucide-react"
import { Map } from "./map"

interface LiveTrackingProps {
  pickupLocation: string
  onComplete: () => void
  onCancel: () => void
}

export function LiveTracking({ pickupLocation, onComplete, onCancel }: LiveTrackingProps) {
  const [eta, setEta] = useState(5)
  const [distance, setDistance] = useState(1.2)
  const [busPosition, setBusPosition] = useState<[number, number]>([14.68, -17.45])
  const pickupPos: [number, number] = [14.6937, -17.4441]

  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimeout(onComplete, 2000)
          return 0
        }
        return prev - 1
      })
      setDistance((prev) => Math.max(0.1, prev - 0.2))

      setBusPosition((prev) => {
        const [lat, lng] = prev
        const targetLat = pickupPos[0]
        const targetLng = pickupPos[1]
        const newLat = lat + (targetLat - lat) * 0.15
        const newLng = lng + (targetLng - lng) * 0.15
        return [newLat, newLng]
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [onComplete])

  const route: Array<[number, number]> = [busPosition, pickupPos]

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="flex-1 relative z-0">
        <Map
          center={pickupPos}
          zoom={14}
          markers={[
            {
              position: busPosition,
              type: "bus",
              label: "Bus #A-247",
            },
            {
              position: pickupPos,
              type: "pickup",
              label: pickupLocation,
            },
          ]}
          route={route}
        />
      </div>

      {/* ETA Card */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <Card className="p-4 bg-card/95 backdrop-blur-sm border-accent/20 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{eta} min</p>
                <p className="text-sm text-muted-foreground">{distance.toFixed(1)} km</p>
              </div>
            </div>
            <Badge className="bg-success text-success-foreground">À l'heure</Badge>
          </div>
        </Card>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-card rounded-t-3xl shadow-2xl p-6 space-y-4">
        <div className="w-12 h-1 bg-border rounded-full mx-auto" />

        {/* Driver Info */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
          <Avatar className="h-16 w-16 border-2 border-accent">
            <AvatarImage src="/professional-bus-driver.png" />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-lg">John Driver</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm font-medium">4.9</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Bus #A-247 • Ligne Bleue</p>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full bg-transparent">
              <Phone className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full bg-transparent">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Lieu de Ramassage</p>
              <p className="font-medium">{pickupLocation}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Destination</p>
              <p className="font-medium">Bâtiment du Bureau Principal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Places Disponibles</p>
              <p className="font-medium">8 places sur 12 disponibles</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-12 bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            onClick={onCancel}
          >
            <X className="h-5 w-5 mr-2" />
            Annuler le Trajet
          </Button>
          <Button size="lg" className="flex-1 h-12 bg-accent hover:bg-accent/90 text-accent-foreground">
            Partager l'ETA
          </Button>
        </div>

        {eta === 0 && (
          <Card className="p-4 bg-success/10 border-success/20 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
                <Bus className="h-5 w-5 text-success-foreground" />
              </div>
              <div>
                <p className="font-semibold text-success">Le bus est arrivé !</p>
                <p className="text-sm text-muted-foreground">Veuillez monter dans le bus</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
