"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card } from "./ui/card"
import { Pencil, Trash2, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getPassengers,
  updatePassenger,
  deletePassenger,
  type Passenger,
} from "@/app/actions/passenger-actions"

export function PassengersManagement() {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })

  const loadPassengers = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getPassengers()
      setPassengers(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les passagers",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }, [toast])

  useEffect(() => {
    loadPassengers()
  }, [loadPassengers])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPassenger) return

    try {
      const result = await updatePassenger(editingPassenger.id, formData)
      if (!result.success) throw new Error(result.error)
      toast({ title: "Succes", description: "Passager modifie avec succes" })
      resetForm()
      loadPassengers()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le passager",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Etes-vous sur de vouloir supprimer ce passager ? Cette action est irreversible.")) return

    try {
      const result = await deletePassenger(id)
      if (!result.success) throw new Error(result.error)
      toast({ title: "Succes", description: "Passager supprime avec succes" })
      loadPassengers()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le passager",
        variant: "destructive",
      })
    }
  }

  function resetForm() {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    })
    setEditingPassenger(null)
    setShowEditForm(false)
  }

  function editPassenger(passenger: Passenger) {
    setFormData({
      first_name: passenger.first_name,
      last_name: passenger.last_name,
      email: passenger.email,
      phone: passenger.phone || "",
    })
    setEditingPassenger(passenger)
    setShowEditForm(true)
  }

  const filteredPassengers = passengers.filter(
    (passenger) =>
      passenger.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passenger.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passenger.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passenger.phone?.includes(searchTerm),
  )

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Passagers</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {showEditForm && editingPassenger && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Modifier le passager</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Prenom</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Modifier</Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPassengers.map((passenger) => (
          <Card key={passenger.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {passenger.avatar_url ? (
                  <img
                    src={passenger.avatar_url || "/placeholder.svg"}
                    alt={`${passenger.first_name} ${passenger.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {passenger.first_name?.[0] || "?"}
                    {passenger.last_name?.[0] || "?"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {passenger.first_name} {passenger.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{passenger.email}</p>
                <p className="text-sm text-muted-foreground">{passenger.phone}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Inscrit le {new Date(passenger.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => editPassenger(passenger)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(passenger.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPassengers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? "Aucun passager trouve" : "Aucun passager enregistre"}
        </div>
      )}
    </div>
  )
}
