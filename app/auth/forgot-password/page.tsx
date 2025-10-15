import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ForgotPasswordForm from "@/components/forgot-password-form"

export default async function ForgotPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/")
  }

  return <ForgotPasswordForm />
}
