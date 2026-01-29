"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MapPin, Navigation, Search, CheckCircle2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface LocationPickerProps {
  onConfirm: (location: string) => void
  onBack: () => void
}

export function LocationPicker({ onConfirm, onBack }: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [isInZone, setIsInZone] = useState<boolean>(true)

  const suggestedStops = [
    { name: "Entrée Principale Porte A", address: "123 Avenue du Parc d'Affaires", distance: "0,2 km", inZone: true },
    { name: "Hall du Bâtiment 5", address: "456 Allée de l'Innovation", distance: "0,5 km", inZone: true },
    { name: "Parking C", address: "789 Boulevard Corporate", distance: "0,8 km", inZone: true },
    { name: "Coin Café", address: "321 Rue Principale", distance: "1,2 km", inZone: false },
  ]

  const handleSelectLocation = (location: string, inZone: boolean) => {
    setSelectedLocation(location)
    setIsInZone(inZone)
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Map Area */}
      <div className="flex-1 relative bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <img
          src="/map-view-with-pickup-location-marker.jpg"
          alt="Map"
          className="h-full w-full object-cover opacity-30"
        />

        {/* Draggable Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative animate-bounce">
            <MapPin className="h-16 w-16 text-accent drop-shadow-2xl" fill="currentColor" />
          </div>
        </div>

        {/* Zone Indicator */}
        {selectedLocation && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <Badge
              variant={isInZone ? "default" : "destructive"}
              className={`px-4 py-2 text-sm font-medium shadow-lg ${
                isInZone ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
              }`}
            >
              {isInZone ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Dans la Zone de Service
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Hors Zone de Service
                </>
              )}
            </Badge>
          </div>
        )}
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full bg-card shadow-lg">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Rechercher un lieu..." className="pl-10 h-12 bg-card shadow-lg border-accent/20" />
          </div>
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-card shadow-lg">
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-card rounded-t-3xl shadow-2xl p-6 space-y-4 max-h-[50vh] overflow-y-auto">
        <div className="w-12 h-1 bg-border rounded-full mx-auto" />

        <div>
          <h3 className="text-lg font-semibold mb-3">Points de Ramassage Suggérés</h3>
          <div className="space-y-2">
            {suggestedStops.map((stop, index) => (
              <button
                key={index}
                onClick={() => handleSelectLocation(stop.name, stop.inZone)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all text-left ${
                  selectedLocation === stop.name
                    ? "bg-accent/10 border-2 border-accent"
                    : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    stop.inZone ? "bg-success/10" : "bg-destructive/10"
                  }`}
                >
                  <MapPin className={`h-5 w-5 ${stop.inZone ? "text-success" : "text-destructive"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{stop.name}</p>
                    {!stop.inZone && (
                      <Badge variant="outline" className="text-xs border-destructive text-destructive">
                        Hors zone
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{stop.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">À {stop.distance}</p>
                </div>
                {selectedLocation === stop.name && <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {!isInZone && selectedLocation && (
          <Card className="p-4 bg-destructive/5 border-destructive/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Lieu hors de la zone de service</p>
                <p className="text-xs text-muted-foreground">
                  Ce lieu est en dehors de notre zone de service actuelle. Veuillez sélectionner un arrêt proche dans la
                  zone.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Button
          onClick={() => selectedLocation && onConfirm(selectedLocation)}
          disabled={!selectedLocation || !isInZone}
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg disabled:opacity-50"
        >
          Confirmer le Lieu de Ramassage
        </Button>
      </div>
    </div>
  )
}
