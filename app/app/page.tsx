import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AppContent from "@/components/app-content"

export default async function AppPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Récupérer le profil de l'utilisateur
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return <AppContent user={data.user} profile={profile} />
}
