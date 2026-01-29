"use server"

import { signIn, signUp, deleteSession, createPasswordResetToken, resetPassword, changePassword, getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email et mot de passe requis" }
  }

  try {
    const result = await signIn(email, password)
    if (!result) {
      return { error: "Identifiants de connexion invalides" }
    }
    return { success: true, role: result.user.role }
  } catch (error) {
    console.error("[Auth] Login error:", error)
    return { error: "Une erreur est survenue lors de la connexion" }
  }
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string

  if (!email || !password) {
    return { error: "Email et mot de passe requis" }
  }

  try {
    await signUp({
      email,
      password,
      firstName,
      lastName,
      phone,
    })
    return { success: true }
  } catch (error: any) {
    console.error("[Auth] SignUp error:", error)
    if (error.message?.includes("duplicate key")) {
      return { error: "Cet email est déjà utilisé" }
    }
    return { error: "Une erreur est survenue lors de l'inscription" }
  }
}

export async function logoutAction() {
  await deleteSession()
  redirect("/auth/login")
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email requis" }
  }

  try {
    const token = await createPasswordResetToken(email)
    if (!token) {
      // On ne révèle pas si l'email existe ou non pour des raisons de sécurité
      return { success: true }
    }

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // Pour l'instant, on log le token pour le développement
    console.log("[Auth] Password reset token:", token)
    console.log("[Auth] Reset link:", `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`)

    return { success: true }
  } catch (error) {
    console.error("[Auth] Forgot password error:", error)
    return { error: "Une erreur est survenue" }
  }
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string

  if (!token || !password) {
    return { error: "Token et mot de passe requis" }
  }

  try {
    const success = await resetPassword(token, password)
    if (!success) {
      return { error: "Lien de réinitialisation invalide ou expiré" }
    }
    return { success: true }
  } catch (error) {
    console.error("[Auth] Reset password error:", error)
    return { error: "Une erreur est survenue" }
  }
}

export async function changePasswordAction(formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  if (!currentPassword || !newPassword) {
    return { error: "Mot de passe actuel et nouveau mot de passe requis" }
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Non authentifié" }
    }

    const success = await changePassword(user.id, currentPassword, newPassword)
    if (!success) {
      return { error: "Mot de passe actuel incorrect" }
    }
    return { success: true }
  } catch (error) {
    console.error("[Auth] Change password error:", error)
    return { error: "Une erreur est survenue" }
  }
}
