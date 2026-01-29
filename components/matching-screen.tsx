"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bus, Loader2, X } from "lucide-react"

interface MatchingScreenProps {
  onCancel: () => void
}

export function MatchingScreen({ onCancel }: MatchingScreenProps) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/10 p-6">
      <Card className="w-full max-w-md p-8 text-center space-y-6 bg-card/90 backdrop-blur-sm border-accent/20">
        <div className="relative mx-auto w-32 h-32">
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border-4 border-accent/20 animate-ping" />
          <div className="absolute inset-4 rounded-full border-4 border-accent/40 animate-ping animation-delay-150" />
          <div className="absolute inset-8 rounded-full border-4 border-accent/60 animate-ping animation-delay-300" />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
              <Bus className="h-10 w-10 text-accent animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-balance">Recherche de votre bus...</h2>
          <p className="text-muted-foreground text-pretty">
            Nous vous mettons en relation avec le bus disponible le plus proche
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cela prend généralement quelques secondes</span>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent animate-bounce" />
          <div className="h-2 w-2 rounded-full bg-accent animate-bounce animation-delay-150" />
          <div className="h-2 w-2 rounded-full bg-accent animate-bounce animation-delay-300" />
        </div>

        <Button
          variant="outline"
          size="lg"
          className="w-full h-12 hover:bg-destructive/10 hover:text-destructive hover:border-destructive bg-transparent"
          onClick={onCancel}
        >
          <X className="h-5 w-5 mr-2" />
          Annuler la Recherche
        </Button>
      </Card>
    </div>
  )
}
