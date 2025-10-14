"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card } from "./ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Driver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  license_number: string
  photo_url: string | null
  is_active: boolean
}

export function DriversManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    license_number: "",
    photo_url: "",
  })

  useEffect(() => {
    loadDrivers()
  }, [])

  async function loadDrivers() {
    setIsLoading(true)
    const { data, error } = await supabase.from("drivers").select("*").order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les chauffeurs",
        variant: "destructive",
      })
    } else {
      setDrivers(data || [])
    }
    setIsLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (editingDriver) {
      const { error } = await supabase.from("drivers").update(formData).eq("id", editingDriver.id)

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier le chauffeur",
          variant: "destructive",
        })
      } else {
        toast({ title: "Succès", description: "Chauffeur modifié avec succès" })
        resetForm()
        loadDrivers()
      }
    } else {
      const { error } = await supabase.from("drivers").insert([formData])

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le chauffeur",
          variant: "destructive",
        })
      } else {
        toast({ title: "Succès", description: "Chauffeur ajouté avec succès" })
        resetForm()
        loadDrivers()
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce chauffeur ?")) return

    const { error } = await supabase.from("drivers").delete().eq("id", id)

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le chauffeur",
        variant: "destructive",
      })
    } else {
      toast({ title: "Succès", description: "Chauffeur supprimé avec succès" })
      loadDrivers()
    }
  }

  function resetForm() {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      license_number: "",
      photo_url: "",
    })
    setEditingDriver(null)
    setShowForm(false)
  }

  function editDriver(driver: Driver) {
    setFormData({
      first_name: driver.first_name,
      last_name: driver.last_name,
      email: driver.email,
      phone: driver.phone,
      license_number: driver.license_number,
      photo_url: driver.photo_url || "",
    })
    setEditingDriver(driver)
    setShowForm(true)
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Chauffeurs</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un chauffeur
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingDriver ? "Modifier le chauffeur" : "Nouveau chauffeur"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Prénom</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="license_number">Numéro de permis</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="photo_url">URL de la photo</Label>
                <Input
                  id="photo_url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingDriver ? "Modifier" : "Ajouter"}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver) => (
          <Card key={driver.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {driver.photo_url ? (
                  <img
                    src={driver.photo_url || "/placeholder.svg"}
                    alt={`${driver.first_name} ${driver.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {driver.first_name[0]}
                    {driver.last_name[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {driver.first_name} {driver.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{driver.email}</p>
                <p className="text-sm text-muted-foreground">{driver.phone}</p>
                <p className="text-xs text-muted-foreground mt-1">Permis: {driver.license_number}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => editDriver(driver)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(driver.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {drivers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">Aucun chauffeur enregistré</div>
      )}
    </div>
  )
}
