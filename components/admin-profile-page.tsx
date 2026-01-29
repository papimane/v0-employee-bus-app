"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ArrowLeft, Camera, Loader2 } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface AdminProfilePageProps {
  user: User
  profile: {
    id: string
    first_name: string | null
    last_name: string | null
    phone: string | null
    avatar_url: string | null
    role: string
  } | null
  onBack: () => void
}

export function AdminProfilePage({ user, profile, onBack }: AdminProfilePageProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id)

      if (error) throw error
      setSuccess("Profil mis à jour avec succès")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      setSuccess("Mot de passe modifié avec succès")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const supabase = createClient()
    setIsUploadingPhoto(true)
    setError(null)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        upsert: true,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      setSuccess("Photo de profil mise à jour avec succès")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erreur lors de l'upload de la photo")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Mon Profil</h1>
      </div>

      <div className="container max-w-2xl mx-auto p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-[#08AF6C] flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl || "/placeholder.svg"} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={isUploadingPhoto}
            />
            <Button
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#08AF6C] hover:bg-[#07965E]"
              onClick={() => document.getElementById("avatar-upload")?.click()}
              disabled={isUploadingPhoto}
            >
              {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <Button type="submit" className="w-full bg-[#08AF6C] hover:bg-[#07965E]" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#08AF6C] hover:bg-[#07965E]"
                disabled={isLoading || !newPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  "Changer le mot de passe"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive bg-transparent"
        >
          Se déconnecter
        </Button>
      </div>
    </div>
  )
}
