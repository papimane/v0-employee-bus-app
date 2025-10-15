import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminContent } from "@/components/admin-content"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect("/auth/login")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Vérifier si l'utilisateur est admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  return <AdminContent user={user} profile={profile} />
}
