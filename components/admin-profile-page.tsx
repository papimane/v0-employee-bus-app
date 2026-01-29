"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ArrowLeft, Camera, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { logoutAction } from "@/app/actions/auth-actions"
import { updateProfileAction, changePasswordProfileAction } from "@/app/actions/profile-actions"

interface UserData {
  id: string
  email: string
  role: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
}

interface AdminProfilePageProps {
  user: UserData
  onBack: () => void
}

export function AdminProfilePage({ user, onBack }: AdminProfilePageProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(user.first_name || "")
  const [lastName, setLastName] = useState(user.last_name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("firstName", firstName)
      formData.append("lastName", lastName)
      formData.append("phone", phone)
      formData.append("address", "")

      const result = await updateProfileAction(formData)

      if (result.error) {
        setError(result.error)
        return
      }

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
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("currentPassword", currentPassword)
      formData.append("newPassword", newPassword)

      const result = await changePasswordProfileAction(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess("Mot de passe modifié avec succès")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await logoutAction()
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
            <Button
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#08AF6C] hover:bg-[#07965E]"
              disabled
            >
              <Camera className="h-4 w-4" />
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
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
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
                disabled={isLoading || !currentPassword || !newPassword}
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
