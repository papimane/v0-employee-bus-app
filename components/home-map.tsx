"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Menu, Clock, Users, X } from "lucide-react"
import { Map } from "./map"
import { useState, useEffect } from "react"

interface HomeMapProps {
  onRequestPickup: () => void
}

export function HomeMap({ onRequestPickup }: HomeMapProps) {
  const dakarPort: [number, number] = [14.6937, -17.4441]

  const [requestPending, setRequestPending] = useState(false)
  const [driverAccepted, setDriverAccepted] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false)
  const [busPosition, setBusPosition] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (requestPending && !driverAccepted) {
      const timer = setTimeout(() => {
        setDriverAccepted(true)
        // Position initiale du bus (un peu au nord du port)
        setBusPosition([14.7037, -17.4541])
        // L'utilisateur reste sur cet écran avec le bus visible sur la carte
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [requestPending, driverAccepted])

  const handleRequestPickup = () => {
    if (requestPending) {
      // Annuler la demande
      setRequestPending(false)
      setDriverAccepted(false)
      setBusPosition(null)
      setShowToast(false)
    } else {
      // Nouvelle demande
      setRequestPending(true)
      setShowToast(true)
      // Masquer le toast après 3 secondes
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const markers = [
    {
      position: dakarPort as [number, number],
      type: "user" as const,
      label: "Votre position",
    },
  ]

  // Ajouter le bus si un chauffeur a accepté
  if (driverAccepted && busPosition) {
    markers.push({
      position: busPosition,
      type: "bus" as const,
      label: "Votre bus arrive",
    })
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-0">
        <Map center={dakarPort} zoom={13} markers={markers} />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-card shadow-lg">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full shadow-lg">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">Service Actif</span>
          </div>
          <Avatar className="h-12 w-12 border-2 border-accent shadow-lg">
            <AvatarImage src="/professional-employee-avatar.jpg" />
            <AvatarFallback className="bg-primary text-primary-foreground">EM</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="absolute top-24 left-4 right-4 z-10 flex gap-2">
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

              {/* Favorite Stops */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Arrêts Récents</p>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Bureau Principal</p>
                      <p className="text-sm text-muted-foreground">123 Avenue du Parc d'Affaires</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Campus Nord</p>
                      <p className="text-sm text-muted-foreground">456 Allée de l'Innovation</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleRequestPickup}
            size="lg"
            className={`w-full h-14 text-lg font-semibold shadow-lg transition-all duration-300 ${
              requestPending
                ? "bg-black hover:bg-black/90 text-white"
                : "bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent/20"
            }`}
          >
            {requestPending ? (
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
