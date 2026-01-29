import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createActiveDriver } from "@/app/actions/driver-actions"

export const dynamic = "force-dynamic"

async function createTestDriver() {
  "use server"

  const result = await createActiveDriver(
    "chauffeur.test@buspickup.com",
    "Chauffeur2024!",
    "Jean",
    "Dupont",
    "+221771234567",
    "DL987654321",
  )

  return result
}

export default async function CreateTestDriverPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Vérifier le rôle admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Créer un Chauffeur de Test</CardTitle>
            <CardDescription>Créer un compte chauffeur actif pour les tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="font-medium">Identifiants du chauffeur :</p>
              <p className="text-sm">
                <span className="font-medium">Email :</span> chauffeur.test@buspickup.com
              </p>
              <p className="text-sm">
                <span className="font-medium">Mot de passe :</span> Chauffeur2024!
              </p>
              <p className="text-sm">
                <span className="font-medium">Nom :</span> Jean Dupont
              </p>
              <p className="text-sm">
                <span className="font-medium">Téléphone :</span> +221771234567
              </p>
              <p className="text-sm">
                <span className="font-medium">Permis :</span> DL987654321
              </p>
            </div>

            <form
              action={async () => {
                "use server"
                const result = await createTestDriver()
                if (result.success) {
                  redirect("/admin?success=driver-created")
                }
              }}
            >
              <Button type="submit" className="w-full">
                Créer le Chauffeur
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">Note : Cette page doit être supprimée en production</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
