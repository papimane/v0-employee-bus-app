import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) {
    if (user.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/")
    }
  }

  return <LoginForm />
}
