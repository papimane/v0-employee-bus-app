import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import AppContent from "@/components/app-content"

export const dynamic = "force-dynamic"

export default async function AppPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <AppContent
      user={{
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
      }}
    />
  )
}
