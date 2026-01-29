import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminContent } from "@/components/admin-content"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "admin") {
    redirect("/")
  }

  return (
    <AdminContent
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
