import { query } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function HomePage() {
  // Fetch data directly in the server component
  const employees = await query(`
    SELECT e.*, b.name as bus_stop_name, b.pickup_time
    FROM employees e
    LEFT JOIN bus_stops b ON e.bus_stop_id = b.id
    ORDER BY e.created_at DESC
    LIMIT 5
  `)

  const busStops = await query(`
    SELECT * FROM bus_stops ORDER BY pickup_time
  `)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Employee Bus App</h1>
          <p className="text-muted-foreground">Gestion des trajets en bus pour employés avec PostgreSQL</p>
        </header>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>PostgreSQL non disponible dans v0</AlertTitle>
          <AlertDescription>
            Le driver PostgreSQL natif ne peut pas fonctionner dans l'environnement de prévisualisation v0 ou pendant
            les builds Vercel.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Employees Card */}
          <Card>
            <CardHeader>
              <CardTitle>Employés récents</CardTitle>
              <CardDescription>Liste des derniers employés inscrits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.length > 0 ? (
                  employees.map((employee: any) => (
                    <div key={employee.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                        {employee.bus_stop_name && (
                          <p className="text-xs text-muted-foreground mt-1">🚌 {employee.bus_stop_name}</p>
                        )}
                      </div>
                      {employee.department && <Badge variant="secondary">{employee.department}</Badge>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun employé trouvé</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bus Stops Card */}
          <Card>
            <CardHeader>
              <CardTitle>Arrêts de bus</CardTitle>
              <CardDescription>Horaires et emplacements des arrêts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {busStops.length > 0 ? (
                  busStops.map((stop: any) => (
                    <div key={stop.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{stop.name}</p>
                        {stop.address && <p className="text-sm text-muted-foreground">{stop.address}</p>}
                      </div>
                      {stop.pickup_time && <Badge variant="outline">{stop.pickup_time.slice(0, 5)}</Badge>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun arrêt configuré</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
