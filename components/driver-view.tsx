"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Phone, User, Clock, ArrowLeft } from "lucide-react"
import { Map } from "./map"

interface Passenger {
  id: string
  name: string
  position: [number, number]
  address: string
  waitTime: number
  avatar?: string
}

interface DriverViewProps {
  onBack: () => void
}

export function DriverView({ onBack }: DriverViewProps) {
  const driverPosition: [number, number] = [14.68, -17.45]

  const [passengers] = useState<Passenger[]>([
    {
      id: "1",
      name: "Amadou Diallo",
      position: [14.6937, -17.4441],
      address: "Port de Dakar, Avenue du Port",
      waitTime: 5,
    },
    {
      id: "2",
      name: "Fatou Sall",
      position: [14.7, -17.46],
      address: "Plateau, Rue Mohamed V",
      waitTime: 8,
    },
    {
      id: "3",
      name: "Moussa Ndiaye",
      position: [14.685, -17.435],
      address: "Médina, Avenue Blaise Diagne",
      waitTime: 3,
    },
  ])

  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null)
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false)

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
    })),
  ]

  const handleSelectPassenger = (passenger: Passenger) => {
    setSelectedPassenger(passenger)
  }

  const handleStartNavigation = () => {
    if (selectedPassenger) {
      // Ouvrir Google Maps ou autre app de navigation
      const url = `https://www.google.com/maps/dir/?api=1&origin=${driverPosition[0]},${driverPosition[1]}&destination=${selectedPassenger.position[0]},${selectedPassenger.position[1]}`
      window.open(url, "_blank")
    }
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="flex-1 relative z-0">
        <Map center={driverPosition} zoom={13} markers={markers} route={route} />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-card shadow-lg" onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full shadow-lg">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">En Service</span>
          </div>
          <Avatar className="h-12 w-12 border-2 border-accent shadow-lg">
            <AvatarImage src="/professional-bus-driver.png" />
            <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
          </Avatar>
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
                <h2 className="text-xl font-bold">Demandeurs en Attente</h2>
                <Badge className="bg-accent text-accent-foreground">{passengers.length} personnes</Badge>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {passengers.map((passenger) => (
                  <Card
                    key={passenger.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedPassenger?.id === passenger.id ? "border-accent border-2 bg-accent/5" : ""
                    }`}
                    onClick={() => handleSelectPassenger(passenger)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-muted">
                        <AvatarImage src={passenger.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-6 w-6" />
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
                className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
                onClick={handleStartNavigation}
              >
                <Navigation className="h-5 w-5 mr-2" />
                Démarrer la Navigation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
