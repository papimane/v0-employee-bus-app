"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { DriversManagement } from "./drivers-management"
import { BusesManagement } from "./buses-management"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, Bus } from "lucide-react"

interface AdminContentProps {
  user: User
  profile: any
}

export function AdminContent({ user, profile }: AdminContentProps) {
  const [activeTab, setActiveTab] = useState<"drivers" | "buses">("drivers")
  const router = useRouter()

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
        <div className="text-sm">
          {profile.first_name} {profile.last_name}
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
      </div>

      {/* Content */}
      <div className="p-4">{activeTab === "drivers" ? <DriversManagement /> : <BusesManagement />}</div>
    </div>
  )
}
