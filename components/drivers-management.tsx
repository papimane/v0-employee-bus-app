"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card } from "./ui/card"
import { Plus, Pencil, Trash2, Camera, Loader2, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { inviteDriver, resendDriverInvitation, checkDriverActivation } from "@/app/actions/driver-actions"

interface Driver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  license_number: string
  photo_url: string | null
  is_active: boolean
  user_id?: string
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

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [driverActivationStatus, setDriverActivationStatus] = useState<Record<string, boolean>>({})

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

  useEffect(() => {
    async function checkActivations() {
      const statuses: Record<string, boolean> = {}
      for (const driver of drivers) {
        if (driver.user_id) {
          const result = await checkDriverActivation(driver.user_id)
          if (result.success) {
            statuses[driver.id] = result.isActivated || false
          }
        }
      }
      setDriverActivationStatus(statuses)
    }
    if (drivers.length > 0) {
      checkActivations()
    }
  }, [drivers])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let photoUrl = formData.photo_url

    if (photoFile) {
      setIsUploadingPhoto(true)
      try {
        const fileExt = photoFile.name.split(".").pop()
        const fileName = `driver-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, photoFile, {
          upsert: true,
        })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath)

        photoUrl = publicUrl
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'uploader la photo",
          variant: "destructive",
        })
        setIsUploadingPhoto(false)
        return
      }
      setIsUploadingPhoto(false)
    }

    const driverData = { ...formData, photo_url: photoUrl }

    if (editingDriver) {
      const { error } = await supabase.from("drivers").update(driverData).eq("id", editingDriver.id)

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
      try {
        const result = await inviteDriver(formData.email, formData.first_name, formData.last_name, formData.phone)

        if (!result.success) {
          throw new Error(result.error)
        }

        const { error: driverError } = await supabase.from("drivers").insert([
          {
            ...driverData,
            user_id: result.userId,
          },
        ])

        if (driverError) throw driverError

        if (result.userId) {
          await supabase.from("profiles").update({ role: "driver" }).eq("id", result.userId)
        }

        toast({
          title: "Succès",
          description: "Chauffeur ajouté avec succès. Un email d'activation a été envoyé.",
        })
        resetForm()
        loadDrivers()
      } catch (error) {
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Impossible d'ajouter le chauffeur",
          variant: "destructive",
        })
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

  async function handleResendActivation(driver: Driver) {
    if (!driver.user_id) {
      toast({
        title: "Erreur",
        description: "Ce chauffeur n'a pas de compte utilisateur associé",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await resendDriverInvitation(driver.email)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Succès",
        description: "Email d'activation renvoyé avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de renvoyer l'activation",
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
    setPhotoFile(null)
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
                <input
                  type="file"
                  id="driver-photo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={isUploadingPhoto}
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#08AF6C] hover:bg-[#07965E]"
                  onClick={() => document.getElementById("driver-photo-upload")?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
              </div>
            </div>

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
              <Button type="submit" disabled={isUploadingPhoto}>
                {isUploadingPhoto ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upload...
                  </>
                ) : editingDriver ? (
                  "Modifier"
                ) : (
                  "Ajouter"
                )}
              </Button>
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
                {driver.user_id && (
                  <p className="text-xs mt-1">
                    {driverActivationStatus[driver.id] ? (
                      <span className="text-green-600">✓ Compte activé</span>
                    ) : (
                      <span className="text-orange-600">⚠ En attente d'activation</span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => editDriver(driver)}>
                <Pencil className="h-4 w-4" />
              </Button>
              {driver.user_id && !driverActivationStatus[driver.id] && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResendActivation(driver)}
                  title="Renvoyer l'email d'activation"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              )}
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
