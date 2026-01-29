"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, Star, MapPin, Clock, DollarSign } from "lucide-react"
import { useState } from "react"

interface TripCompleteProps {
  onBackToHome: () => void
}

export function TripComplete({ onBackToHome }: TripCompleteProps) {
  const [rating, setRating] = useState(0)

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-success/10 via-background to-accent/5 p-6">
      <Card className="w-full max-w-md p-8 space-y-6 bg-card/95 backdrop-blur-sm">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="h-24 w-24 rounded-full bg-success/20" />
            </div>
            <div className="relative h-24 w-24 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-success" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Trajet Terminé !</h2>
          <p className="text-muted-foreground">Merci d'avoir voyagé avec nous</p>
        </div>

        {/* Trip Summary */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Distance</span>
            </div>
            <span className="font-medium">3,2 km</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Durée</span>
            </div>
            <span className="font-medium">12 min</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Coût</span>
            </div>
            <span className="font-medium text-success">Gratuit (Entreprise)</span>
          </div>
        </div>

        {/* Driver Rating */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-accent">
              <AvatarImage src="/professional-bus-driver.png" />
              <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">John Driver</p>
              <p className="text-sm text-muted-foreground">Bus #A-247</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Évaluez votre trajet</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`h-10 w-10 ${star <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={onBackToHome}
            size="lg"
            className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Retour à l'Accueil
          </Button>
          <Button variant="outline" size="lg" className="w-full h-12 bg-transparent">
            Voir l'Historique des Trajets
          </Button>
        </div>
      </Card>
    </div>
  )
}
