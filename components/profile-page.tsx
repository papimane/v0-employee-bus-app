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

interface ProfilePageProps {
  user: UserData
  onBack: () => void
}

export function ProfilePage({ user, onBack }: ProfilePageProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(user.first_name || "")
  const [lastName, setLastName] = useState(user.last_name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [address, setAddress] = useState("")
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
      formData.append("address", address)

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
    <div className="relative h-full w-full bg-gradient-to-br from-[#0A1628] to-[#1a2942] overflow-y-auto">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10">
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="container max-w-2xl mx-auto p-6 pt-20">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#08AF6C] to-[#07965E] flex items-center justify-center overflow-hidden">
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
          <p className="mt-4 text-sm text-white/60">{user.email}</p>
        </div>

        <Card className="mb-6 border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-white">
                  Adresse
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-green-400">{success}</p>}
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

        <Card className="mb-6 border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Changer le mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white">
                  Mot de passe actuel
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">
                  Nouveau mot de passe
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
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
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
        >
          Se déconnecter
        </Button>
      </div>
    </div>
  )
}
