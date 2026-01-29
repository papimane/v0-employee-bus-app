import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ForgotPasswordForm from "@/components/forgot-password-form"

export const dynamic = "force-dynamic"

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
