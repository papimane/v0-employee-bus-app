"use server"

import { createAdminClient } from "@/lib/supabase/server"

function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // En production/preview sur Vercel, utiliser VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // En développement local
  return "http://localhost:3000"
}

export async function inviteDriver(email: string, firstName: string, lastName: string, phone: string) {
  const supabase = await createAdminClient()

  const redirectUrl = `${getAppUrl()}/auth/set-password`

  try {
    // Utiliser l'API Admin pour inviter l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      },
      redirectTo: redirectUrl,
    })

    if (authError) throw authError

    return { success: true, userId: authData.user.id }
  } catch (error) {
    console.error("Error inviting driver:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" }
  }
}

export async function resendDriverInvitation(email: string) {
  const supabase = await createAdminClient()

  const redirectUrl = `${getAppUrl()}/auth/set-password`

  try {
    // Renvoyer l'invitation
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error resending invitation:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" }
  }
}

export async function checkDriverActivation(userId: string) {
  const supabase = await createAdminClient()

  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId)

    if (error) throw error

    return {
      success: true,
      isActivated: !!data.user.email_confirmed_at,
      emailConfirmedAt: data.user.email_confirmed_at,
    }
  } catch (error) {
    console.error("Error checking activation:", error)
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
  const supabase = await createAdminClient()

  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find((u) => u.email === email)

    if (existingUser) {
      console.log("[v0] Deleting existing user:", existingUser.id)
      // Supprimer d'abord les données liées
      await supabase.from("drivers").delete().eq("user_id", existingUser.id)
      await supabase.from("profiles").delete().eq("id", existingUser.id)
      await supabase.auth.admin.deleteUser(existingUser.id)
      // Attendre un peu pour que la suppression soit complète
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        role: "driver",
      },
    })

    if (authError) throw authError
    console.log("[v0] User created:", authData.user.id)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        role: "driver",
      })
      .eq("id", authData.user.id)

    if (profileError) {
      console.error("[v0] Error updating profile:", profileError)
      throw profileError
    }
    console.log("[v0] Profile updated")

    const { error: driverError } = await supabase.from("drivers").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      license_number: licenseNumber,
      user_id: authData.user.id,
      is_active: true,
    })

    if (driverError) {
      console.error("[v0] Error creating driver:", driverError)
      throw driverError
    }
    console.log("[v0] Driver entry created")

    console.log("[v0] Driver created successfully:", authData.user.id)
    return { success: true, userId: authData.user.id, email, password }
  } catch (error) {
    console.error("[v0] Error creating active driver:", error)
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" }
  }
}
