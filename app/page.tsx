"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HomeMap } from "@/components/home-map"
import { LocationPicker } from "@/components/location-picker"
import { MatchingScreen } from "@/components/matching-screen"
import { LiveTracking } from "@/components/live-tracking"
import { TripComplete } from "@/components/trip-complete"
import { DriverView } from "@/components/driver-view"
import { Users, User } from "lucide-react"

type Screen = "home" | "picker" | "matching" | "tracking" | "complete" | "driver"

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")
  const [pickupLocation, setPickupLocation] = useState<string>("")
  const [isDriverMode, setIsDriverMode] = useState(false)

  const handleRequestPickup = () => {
    setCurrentScreen("picker")
  }

  const handleLocationConfirm = (location: string) => {
    setPickupLocation(location)
    setCurrentScreen("matching")

    // Simulate matching delay
    setTimeout(() => {
      setCurrentScreen("tracking")
    }, 3000)
  }

  const handleTripComplete = () => {
    setCurrentScreen("complete")
  }

  const handleBackToHome = () => {
    setCurrentScreen("home")
    setPickupLocation("")
  }

  const handleCancel = () => {
    setCurrentScreen("home")
    setPickupLocation("")
  }

  const toggleMode = () => {
    setIsDriverMode(!isDriverMode)
    setCurrentScreen(isDriverMode ? "home" : "driver")
  }

  return (
    <main className="h-screen w-full overflow-hidden relative">
      {(currentScreen === "home" || currentScreen === "driver") && (
        <div className="absolute top-4 right-4 z-20">
          <Button
            onClick={toggleMode}
            size="lg"
            className="rounded-full shadow-lg bg-card hover:bg-card/90 text-foreground border-2 border-accent"
          >
            {isDriverMode ? (
              <>
                <User className="h-5 w-5 mr-2" />
                Mode Passager
              </>
            ) : (
              <>
                <Users className="h-5 w-5 mr-2" />
                Mode Chauffeur
              </>
            )}
          </Button>
        </div>
      )}

      {currentScreen === "driver" && <DriverView onBack={handleBackToHome} />}
      {currentScreen === "home" && <HomeMap onRequestPickup={handleRequestPickup} />}
      {currentScreen === "picker" && (
        <LocationPicker onConfirm={handleLocationConfirm} onBack={() => setCurrentScreen("home")} />
      )}
      {currentScreen === "matching" && <MatchingScreen onCancel={handleCancel} />}
      {currentScreen === "tracking" && (
        <LiveTracking pickupLocation={pickupLocation} onComplete={handleTripComplete} onCancel={handleCancel} />
      )}
      {currentScreen === "complete" && <TripComplete onBackToHome={handleBackToHome} />}
    </main>
  )
}
