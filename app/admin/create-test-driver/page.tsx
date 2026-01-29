import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { query } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createActiveDriver } from "@/app/actions/driver-actions"

export const dynamic = "force-dynamic"

async function getUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value
  
  if (!sessionToken) return null
  
  const result = await query(
    `SELECT u.* FROM users u
     JOIN sessions s ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [sessionToken]
  )
  
  return result.rows[0] || null
}

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
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verifier le role admin
  if (user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Creer un Chauffeur de Test</CardTitle>
            <CardDescription>Creer un compte chauffeur actif pour les tests</CardDescription>
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
                <span className="font-medium">Telephone :</span> +221771234567
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
                Creer le Chauffeur
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">Note : Cette page doit etre supprimee en production</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
