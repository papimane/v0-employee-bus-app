"use server"

import { getCurrentUser, changePassword } from "@/lib/auth"
import { userRepository } from "@/lib/db"

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: "Non authentifié" }
  }

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string

  try {
    await userRepository.update(user.id, {
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
      address: address || null,
    })
    return { success: true }
  } catch (error) {
    console.error("[Profile] Update error:", error)
    return { error: "Une erreur est survenue lors de la mise à jour du profil" }
  }
}

export async function changePasswordProfileAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: "Non authentifié" }
  }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  if (!currentPassword || !newPassword) {
    return { error: "Les deux mots de passe sont requis" }
  }

  if (newPassword.length < 6) {
    return { error: "Le nouveau mot de passe doit contenir au moins 6 caractères" }
  }

  try {
    const success = await changePassword(user.id, currentPassword, newPassword)
    if (!success) {
      return { error: "Mot de passe actuel incorrect" }
    }
    return { success: true }
  } catch (error) {
    console.error("[Profile] Change password error:", error)
    return { error: "Une erreur est survenue" }
  }
}
