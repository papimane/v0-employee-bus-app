"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Plus, Pencil, Trash2, Bus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BusType {
  id: string
  brand: string
  model: string
  license_plate: string
  capacity: number
  driver_id: string | null
  is_active: boolean
}

interface Driver {
  id: string
  first_name: string
  last_name: string
}

export function BusesManagement() {
  const [buses, setBuses] = useState<BusType[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBus, setEditingBus] = useState<BusType | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    license_plate: "",
    capacity: "",
    driver_id: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)

    const [busesResult, driversResult] = await Promise.all([
      supabase.from("buses").select("*").order("created_at", { ascending: false }),
      supabase.from("drivers").select("id, first_name, last_name").eq("is_active", true),
    ])

    if (busesResult.error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les bus",
        variant: "destructive",
      })
    } else {
      setBuses(busesResult.data || [])
    }

    if (driversResult.error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les chauffeurs",
        variant: "destructive",
      })
    } else {
      setDrivers(driversResult.data || [])
    }

    setIsLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const data = {
      ...formData,
      capacity: Number.parseInt(formData.capacity),
      driver_id: formData.driver_id || null,
    }

    if (editingBus) {
      const { error } = await supabase.from("buses").update(data).eq("id", editingBus.id)

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier le bus",
          variant: "destructive",
        })
      } else {
        toast({ title: "Succès", description: "Bus modifié avec succès" })
        resetForm()
        loadData()
      }
    } else {
      const { error } = await supabase.from("buses").insert([data])

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le bus",
          variant: "destructive",
        })
      } else {
        toast({ title: "Succès", description: "Bus ajouté avec succès" })
        resetForm()
        loadData()
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bus ?")) return

    const { error } = await supabase.from("buses").delete().eq("id", id)

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le bus",
        variant: "destructive",
      })
    } else {
      toast({ title: "Succès", description: "Bus supprimé avec succès" })
      loadData()
    }
  }

  function resetForm() {
    setFormData({
      brand: "",
      model: "",
      license_plate: "",
      capacity: "",
      driver_id: "",
    })
    setEditingBus(null)
    setShowForm(false)
  }

  function editBus(bus: BusType) {
    setFormData({
      brand: bus.brand,
      model: bus.model,
      license_plate: bus.license_plate,
      capacity: bus.capacity.toString(),
      driver_id: bus.driver_id || "",
    })
    setEditingBus(bus)
    setShowForm(true)
  }

  function getDriverName(driverId: string | null) {
    if (!driverId) return "Non assigné"
    const driver = drivers.find((d) => d.id === driverId)
    return driver ? `${driver.first_name} ${driver.last_name}` : "Non assigné"
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Bus</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bus
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editingBus ? "Modifier le bus" : "Nouveau bus"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Modèle</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="license_plate">Immatriculation</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Nombre de places</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="driver_id">Chauffeur assigné</Label>
                <Select
                  value={formData.driver_id}
                  onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un chauffeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Non assigné</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingBus ? "Modifier" : "Ajouter"}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buses.map((bus) => (
          <Card key={bus.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bus className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {bus.brand} {bus.model}
                </h3>
                <p className="text-sm text-muted-foreground">{bus.license_plate}</p>
                <p className="text-sm text-muted-foreground">{bus.capacity} places</p>
                <p className="text-xs text-muted-foreground mt-1">Chauffeur: {getDriverName(bus.driver_id)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => editBus(bus)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(bus.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {buses.length === 0 && <div className="text-center py-12 text-muted-foreground">Aucun bus enregistré</div>}
    </div>
  )
}
