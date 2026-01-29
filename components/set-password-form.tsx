"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { resetPasswordAction } from "@/app/actions/auth-actions"

function SetPasswordFormContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setIsLoading(false)
      return
    }

    if (!token) {
      setError("Token d'activation manquant")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("token", token)
      formData.append("password", password)

      const result = await resetPasswordAction(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      router.push("/auth/login?message=Mot de passe créé avec succès. Vous pouvez maintenant vous connecter.")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Lien invalide</CardTitle>
          <CardDescription className="text-center text-white/60">
            Ce lien d'activation est invalide ou a expiré.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/auth/login")} className="w-full">
            Retour à la connexion
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-white">Créer votre mot de passe</CardTitle>
        <CardDescription className="text-center text-white/60">
          Bienvenue ! Veuillez créer un mot de passe pour activer votre compte chauffeur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              placeholder="Minimum 6 caractères"
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
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              placeholder="Retapez votre mot de passe"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full bg-[#08AF6C] hover:bg-[#07965E] text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer mon mot de passe"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function SetPasswordForm() {
  return (
    <Suspense fallback={<div className="text-white">Chargement...</div>}>
      <SetPasswordFormContent />
    </Suspense>
  )
}
