import { getCurrentUser } from "@/lib/auth"
import AppContent from "@/components/app-content"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role === "admin") {
    redirect("/admin")
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
