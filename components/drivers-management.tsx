"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card } from "./ui/card"
import { Plus, Pencil, Trash2, Camera, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  type Driver,
} from "@/app/actions/driver-actions"

export function DriversManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    license_number: "",
    photo_url: "",
  })

  const [photoPreview, setPhotoPreview] = useState<string>("")

  const loadDrivers = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getDrivers()
      setDrivers(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les chauffeurs",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }, [toast])

  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (editingDriver) {
        const result = await updateDriver(editingDriver.id, formData)
        if (!result.success) throw new Error(result.error)
        toast({ title: "Succes", description: "Chauffeur modifie avec succes" })
      } else {
        const result = await createDriver(formData)
        if (!result.success) throw new Error(result.error)
        toast({ title: "Succes", description: "Chauffeur ajoute avec succes" })
      }
      resetForm()
      loadDrivers()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder le chauffeur",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Etes-vous sur de vouloir supprimer ce chauffeur ?")) return

    try {
      const result = await deleteDriver(id)
      if (!result.success) throw new Error(result.error)
      toast({ title: "Succes", description: "Chauffeur supprime avec succes" })
      loadDrivers()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le chauffeur",
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
      license_number: "",
      photo_url: "",
    })
    setPhotoPreview("")
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
    setPhotoPreview(driver.photo_url || "")
    setEditingDriver(driver)
    setShowForm(true)
  }

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
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">
                      {formData.first_name[0] || "?"}
                      {formData.last_name[0] || "?"}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#08AF6C] hover:bg-[#07965E]"
                  onClick={() => {
                    const url = prompt("URL de la photo:")
                    if (url) {
                      setFormData({ ...formData, photo_url: url })
                      setPhotoPreview(url)
                    }
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

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
                />
              </div>
              <div>
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="license_number">Numero de permis</Label>
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
                  onChange={(e) => {
                    setFormData({ ...formData, photo_url: e.target.value })
                    setPhotoPreview(e.target.value)
                  }}
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
                <p className="text-xs mt-1">
                  {driver.is_active ? (
                    <span className="text-green-600">Actif</span>
                  ) : (
                    <span className="text-orange-600">Inactif</span>
                  )}
                </p>
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
        <div className="text-center py-12 text-muted-foreground">Aucun chauffeur enregistre</div>
      )}
    </div>
  )
}
