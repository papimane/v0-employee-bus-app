"use server"

import { query, driverRepository, userRepository } from "@/lib/db"
import { hashPassword, createPasswordResetToken } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export async function inviteDriver(email: string, firstName: string, lastName: string, phone: string) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      return { success: false, error: "Cet email est déjà utilisé" }
    }

    // Créer l'utilisateur avec un mot de passe temporaire
    const tempPassword = uuidv4()
    const passwordHash = await hashPassword(tempPassword)

    const user = await userRepository.create({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: "driver",
    })

    // Créer le chauffeur
    await driverRepository.create({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      license_number: "",
    })

    // Créer un token de réinitialisation pour définir le mot de passe
    const token = await createPasswordResetToken(email)
    
    const redirectUrl = `${getAppUrl()}/auth/set-password?token=${token}`
    console.log("[Driver] Invitation link:", redirectUrl)

    // TODO: Envoyer l'email d'invitation avec le lien

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("[Driver] Error inviting driver:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" }
  }
}

export async function resendDriverInvitation(email: string) {
  try {
    const token = await createPasswordResetToken(email)
    if (!token) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    const redirectUrl = `${getAppUrl()}/auth/set-password?token=${token}`
    console.log("[Driver] Resend invitation link:", redirectUrl)

    // TODO: Envoyer l'email d'invitation avec le lien

    return { success: true }
  } catch (error) {
    console.error("[Driver] Error resending invitation:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" }
  }
}

export async function checkDriverActivation(userId: string) {
  try {
    const user = await userRepository.findById(userId)
    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    return {
      success: true,
      isActivated: user.email_verified,
      emailConfirmedAt: user.email_verified ? user.updated_at : null,
    }
  } catch (error) {
    console.error("[Driver] Error checking activation:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" }
  }
}

export async function createActiveDriver(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
  licenseNumber: string,
) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      // Supprimer l'utilisateur existant et ses données liées
      await query("DELETE FROM drivers WHERE user_id = $1", [existingUser.id])
      await query("DELETE FROM sessions WHERE user_id = $1", [existingUser.id])
      await userRepository.delete(existingUser.id)
    }

    // Créer l'utilisateur
    const passwordHash = await hashPassword(password)
    const user = await userRepository.create({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: "driver",
    })

    // Marquer l'email comme vérifié
    await query("UPDATE users SET email_verified = true WHERE id = $1", [user.id])

    // Créer le chauffeur
    await driverRepository.create({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      license_number: licenseNumber,
    })

    // Activer le chauffeur
    await query("UPDATE drivers SET is_active = true, is_account_activated = true WHERE user_id = $1", [user.id])

    return { success: true, userId: user.id, email, password }
  } catch (error) {
    console.error("[Driver] Error creating active driver:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" }
  }
}

export async function getAllDrivers() {
  try {
    const drivers = await driverRepository.findAll()
    return { success: true, drivers }
  } catch (error) {
    console.error("[Driver] Error getting drivers:", error)
    return { success: false, error: String(error), drivers: [] }
  }
}

export async function updateDriver(id: string, data: { first_name?: string; last_name?: string; phone?: string; license_number?: string; is_active?: boolean }) {
  try {
    const driver = await driverRepository.update(id, data)
    return { success: true, driver }
  } catch (error) {
    console.error("[Driver] Error updating driver:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteDriver(id: string) {
  try {
    const driver = await driverRepository.findById(id)
    if (driver?.user_id) {
      await query("DELETE FROM sessions WHERE user_id = $1", [driver.user_id])
      await userRepository.delete(driver.user_id)
    }
    await driverRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error("[Driver] Error deleting driver:", error)
    return { success: false, error: String(error) }
  }
}
