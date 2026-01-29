import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/sign-up-form"

export const dynamic = "force-dynamic"

export default async function SignUpPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/")
  }

  return <SignUpForm />
}
