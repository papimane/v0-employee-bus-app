"use client"

import { useState } from "react"
import { DriversManagement } from "./drivers-management"
import { BusesManagement } from "./buses-management"
import { PassengersManagement } from "./passengers-management"
import { AdminProfilePage } from "./admin-profile-page"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, Bus, UserCircle, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface UserData {
  id: string
  email: string
  role: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
}

interface AdminContentProps {
  user: UserData
}

export function AdminContent({ user }: AdminContentProps) {
  const [activeTab, setActiveTab] = useState<"drivers" | "buses" | "passengers">("drivers")
  const [showProfile, setShowProfile] = useState(false)
  const router = useRouter()

  if (showProfile) {
    return <AdminProfilePage user={user} onBack={() => setShowProfile(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Administration</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/api-docs")}
            className="text-primary-foreground hover:bg-primary-foreground/10 hidden md:flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Documentation API
          </Button>
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
              <AvatarImage src={user.avatar_url || ""} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback className="bg-[#08AF6C] text-white">
                {user.first_name?.[0]?.toUpperCase() || "A"}
                {user.last_name?.[0]?.toUpperCase() || "D"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-right hidden md:block">
              <div className="font-medium">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-xs opacity-75">Administrateur</div>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-card">
        <button
          onClick={() => setActiveTab("drivers")}
          className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "drivers"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-5 w-5" />
          Chauffeurs
        </button>
        <button
          onClick={() => setActiveTab("buses")}
          className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "buses"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bus className="h-5 w-5" />
          Bus
        </button>
        <button
          onClick={() => setActiveTab("passengers")}
          className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "passengers"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCircle className="h-5 w-5" />
          Passagers
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "drivers" ? (
          <DriversManagement />
        ) : activeTab === "buses" ? (
          <BusesManagement />
        ) : (
          <PassengersManagement />
        )}
      </div>
    </div>
  )
}
