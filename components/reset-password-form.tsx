"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { CheckCircle2 } from "lucide-react"
import { resetPasswordAction } from "@/app/actions/auth-actions"

function ResetPasswordFormContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    if (!token) {
      setError("Token de réinitialisation manquant")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("token", token)
      formData.append("password", password)

      const result = await resetPasswordAction(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      setPasswordReset(true)

      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-[#0A1628] to-[#1a2942]">
        <div className="w-full max-w-sm">
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Lien invalide</CardTitle>
              <CardDescription className="text-center">
                Ce lien de réinitialisation est invalide ou a expiré
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/auth/forgot-password")} className="w-full">
                Demander un nouveau lien
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (passwordReset) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-[#0A1628] to-[#1a2942]">
        <div className="w-full max-w-sm">
          <Card className="border-white/10">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-[#08AF6C]" />
              </div>
              <CardTitle className="text-2xl text-center">Mot de passe réinitialisé</CardTitle>
              <CardDescription className="text-center">Votre mot de passe a été modifié avec succès</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Vous allez être redirigé vers la page de connexion...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-[#0A1628] to-[#1a2942]">
      <div className="w-full max-w-sm">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
            <CardDescription>Choisissez un nouveau mot de passe pour votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez votre mot de passe"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-[#0A1628] to-[#1a2942]">Chargement...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  )
}
