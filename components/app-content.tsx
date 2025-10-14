"use client"

import { useState } from "react"
import { HomeMap } from "./home-map"
import { DriverView } from "./driver-view"
import { LocationPicker } from "./location-picker"
import { MatchingScreen } from "./matching-screen"
import { LiveTracking } from "./live-tracking"
import { TripComplete } from "./trip-complete"
import { ProfilePage } from "./profile-page"
import { Button } from "./ui/button"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

type Screen = "home" | "location" | "matching" | "tracking" | "complete" | "driver" | "profile"

interface AppContentProps {
  user: User
  profile: {
    id: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    address: string | null
    avatar_url: string | null
    role: string
  } | null
}

export default function AppContent({ user, profile }: AppContentProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(profile?.role === "driver" ? "driver" : "home")
  const [isDriverMode, setIsDriverMode] = useState(profile?.role === "driver")
  const router = useRouter()

  console.log("[v0] User profile role:", profile?.role)
  console.log("[v0] Is admin:", profile?.role === "admin")

  const toggleMode = () => {
    setIsDriverMode(!isDriverMode)
    setCurrentScreen(isDriverMode ? "home" : "driver")
  }

  const renderScreen = () => {
    if (currentScreen === "profile") {
      return (
        <ProfilePage user={user} profile={profile} onBack={() => setCurrentScreen(isDriverMode ? "driver" : "home")} />
      )
    }

    if (isDriverMode) {
      return <DriverView onOpenProfile={() => setCurrentScreen("profile")} />
    }

    switch (currentScreen) {
      case "home":
        return (
          <HomeMap
            onRequestPickup={() => setCurrentScreen("location")}
            onOpenProfile={() => setCurrentScreen("profile")}
            userProfile={profile}
          />
        )
      case "location":
        return <LocationPicker onConfirm={() => setCurrentScreen("matching")} onBack={() => setCurrentScreen("home")} />
      case "matching":
        return (
          <MatchingScreen onMatched={() => setCurrentScreen("tracking")} onCancel={() => setCurrentScreen("home")} />
        )
      case "tracking":
        return (
          <LiveTracking onComplete={() => setCurrentScreen("complete")} onCancel={() => setCurrentScreen("home")} />
        )
      case "complete":
        return <TripComplete onNewTrip={() => setCurrentScreen("home")} />
      default:
        return (
          <HomeMap
            onRequestPickup={() => setCurrentScreen("location")}
            onOpenProfile={() => setCurrentScreen("profile")}
            userProfile={profile}
          />
        )
    }
  }

  return (
    <main className="h-screen w-full overflow-hidden">
      {profile?.role === "admin" && (
        <Button
          onClick={() => router.push("/admin")}
          className="absolute top-4 left-4 z-20 bg-[#08AF6C] text-white hover:bg-[#07965E]"
          size="sm"
        >
          <Shield className="h-4 w-4 mr-1" />
          Admin
        </Button>
      )}

      <Button
        onClick={toggleMode}
        className="absolute top-4 right-20 z-20 bg-white/90 text-black hover:bg-white"
        size="sm"
      >
        {isDriverMode ? "Mode Passager" : "Mode Chauffeur"}
      </Button>

      {renderScreen()}
    </main>
  )
}
