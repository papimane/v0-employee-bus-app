import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import ForgotPasswordForm from "@/components/forgot-password-form"

export const dynamic = "force-dynamic"

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/")
  }

  return <ForgotPasswordForm />
}
