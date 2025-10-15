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
