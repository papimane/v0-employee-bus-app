"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Book, Code, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function ApiDocsPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)

  const toggleEndpoint = (endpoint: string) => {
    setExpandedEndpoint(expandedEndpoint === endpoint ? null : endpoint)
  }

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-blue-500"
      case "POST":
        return "bg-green-500"
      case "PATCH":
        return "bg-yellow-500"
      case "DELETE":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const endpoints = [
    {
      id: "get-rides",
      method: "GET",
      path: "/api/v1/rides",
      summary: "Récupérer toutes les demandes de ramassage",
      description: "Retourne la liste de toutes les demandes de ramassage avec possibilité de filtrage",
      parameters: [
        { name: "status", type: "string", description: "Filtrer par statut (pending, accepted, completed, cancelled)" },
        { name: "passenger_id", type: "string", description: "Filtrer par ID passager" },
        { name: "driver_id", type: "string", description: "Filtrer par ID chauffeur" },
      ],
      response: `{
  "data": [
    {
      "id": "uuid",
      "passenger_id": "uuid",
      "driver_id": "uuid",
      "pickup_lat": 48.8566,
      "pickup_lng": 2.3522,
      "pickup_address": "123 Rue de la Paix, Paris",
      "status": "pending",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "count": 1
}`,
    },
    {
      id: "post-rides",
      method: "POST",
      path: "/api/v1/rides",
      summary: "Créer une nouvelle demande de ramassage",
      description: "Crée une nouvelle demande de ramassage pour le passager authentifié",
      requestBody: `{
  "pickup_lat": 48.8566,
  "pickup_lng": 2.3522,
  "pickup_address": "123 Rue de la Paix, Paris"
}`,
      response: `{
  "data": {
    "id": "uuid",
    "passenger_id": "uuid",
    "pickup_lat": 48.8566,
    "pickup_lng": 2.3522,
    "pickup_address": "123 Rue de la Paix, Paris",
    "status": "pending",
    "created_at": "2024-01-01T12:00:00Z"
  }
}`,
    },
    {
      id: "get-ride",
      method: "GET",
      path: "/api/v1/rides/{id}",
      summary: "Récupérer une demande spécifique",
      description: "Retourne les détails d'une demande de ramassage par son ID",
      parameters: [{ name: "id", type: "string", description: "ID de la demande (UUID)" }],
      response: `{
  "data": {
    "id": "uuid",
    "passenger_id": "uuid",
    "driver_id": "uuid",
    "pickup_lat": 48.8566,
    "pickup_lng": 2.3522,
    "pickup_address": "123 Rue de la Paix, Paris",
    "status": "accepted",
    "created_at": "2024-01-01T12:00:00Z",
    "accepted_at": "2024-01-01T12:05:00Z"
  }
}`,
    },
    {
      id: "patch-ride",
      method: "PATCH",
      path: "/api/v1/rides/{id}",
      summary: "Mettre à jour une demande",
      description: "Met à jour le statut ou le chauffeur d'une demande",
      parameters: [{ name: "id", type: "string", description: "ID de la demande (UUID)" }],
      requestBody: `{
  "status": "accepted",
  "driver_id": "uuid"
}`,
      response: `{
  "data": {
    "id": "uuid",
    "status": "accepted",
    "driver_id": "uuid",
    "accepted_at": "2024-01-01T12:05:00Z"
  }
}`,
    },
    {
      id: "delete-ride",
      method: "DELETE",
      path: "/api/v1/rides/{id}",
      summary: "Annuler une demande",
      description: "Annule une demande de ramassage (met le statut à 'cancelled')",
      parameters: [{ name: "id", type: "string", description: "ID de la demande (UUID)" }],
      response: `{
  "data": {
    "id": "uuid",
    "status": "cancelled"
  }
}`,
    },
    {
      id: "get-drivers",
      method: "GET",
      path: "/api/v1/drivers",
      summary: "Récupérer tous les chauffeurs",
      description: "Retourne la liste de tous les chauffeurs avec possibilité de filtrage",
      parameters: [{ name: "active", type: "boolean", description: "Filtrer par statut actif" }],
      response: `{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "vehicle_number": "BUS-001",
      "is_active": true,
      "current_lat": 48.8566,
      "current_lng": 2.3522
    }
  ],
  "count": 1
}`,
    },
    {
      id: "get-passengers",
      method: "GET",
      path: "/api/v1/passengers",
      summary: "Récupérer tous les passagers",
      description: "Retourne la liste de tous les passagers",
      response: `{
  "data": [
    {
      "id": "uuid",
      "email": "passenger@example.com",
      "full_name": "Jean Dupont",
      "role": "passenger"
    }
  ],
  "count": 1
}`,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Documentation API REST</h1>
          <p className="text-muted-foreground text-lg">
            API REST complète pour l'application de ramassage par bus d'entreprise
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Endpoints
              </CardTitle>
              <CardDescription>7 endpoints REST pour gérer les demandes, chauffeurs et passagers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• GET /api/v1/rides</li>
                <li>• POST /api/v1/rides</li>
                <li>• GET /api/v1/drivers</li>
                <li>• GET /api/v1/passengers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Format
              </CardTitle>
              <CardDescription>Toutes les réponses sont au format JSON</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Content-Type: application/json</li>
                <li>• Authentification: Session cookies</li>
                <li>• Codes HTTP standards</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Ressources
              </CardTitle>
              <CardDescription>Liens utiles et documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                <Link href="/openapi.json" target="_blank">
                  Spécification OpenAPI
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                <a href="https://node-postgres.com/" target="_blank" rel="noopener noreferrer">
                  Documentation PostgreSQL
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Référence API</CardTitle>
            <CardDescription>Documentation complète de tous les endpoints disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rides" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rides">Demandes</TabsTrigger>
                <TabsTrigger value="drivers">Chauffeurs</TabsTrigger>
                <TabsTrigger value="passengers">Passagers</TabsTrigger>
              </TabsList>

              <TabsContent value="rides" className="space-y-4 mt-6">
                {endpoints
                  .filter((e) => e.path.includes("/rides"))
                  .map((endpoint) => (
                    <Card key={endpoint.id} className="border-l-4 border-l-primary">
                      <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleEndpoint(endpoint.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getMethodColor(endpoint.method)} text-white font-mono`}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.path}</code>
                          </div>
                          {expandedEndpoint === endpoint.id ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                        <CardDescription className="mt-2">{endpoint.summary}</CardDescription>
                      </CardHeader>

                      {expandedEndpoint === endpoint.id && (
                        <CardContent className="space-y-4 pt-0">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                          </div>

                          {endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Paramètres</h4>
                              <div className="space-y-2">
                                {endpoint.parameters.map((param) => (
                                  <div key={param.name} className="flex gap-2 text-sm">
                                    <code className="bg-muted px-2 py-1 rounded">{param.name}</code>
                                    <Badge variant="outline">{param.type}</Badge>
                                    <span className="text-muted-foreground">{param.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {endpoint.requestBody && (
                            <div>
                              <h4 className="font-semibold mb-2">Corps de la requête</h4>
                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                                <code>{endpoint.requestBody}</code>
                              </pre>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold mb-2">Réponse (200 OK)</h4>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{endpoint.response}</code>
                            </pre>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="drivers" className="space-y-4 mt-6">
                {endpoints
                  .filter((e) => e.path.includes("/drivers"))
                  .map((endpoint) => (
                    <Card key={endpoint.id} className="border-l-4 border-l-primary">
                      <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleEndpoint(endpoint.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getMethodColor(endpoint.method)} text-white font-mono`}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.path}</code>
                          </div>
                          {expandedEndpoint === endpoint.id ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                        <CardDescription className="mt-2">{endpoint.summary}</CardDescription>
                      </CardHeader>

                      {expandedEndpoint === endpoint.id && (
                        <CardContent className="space-y-4 pt-0">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                          </div>

                          {endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Paramètres</h4>
                              <div className="space-y-2">
                                {endpoint.parameters.map((param) => (
                                  <div key={param.name} className="flex gap-2 text-sm">
                                    <code className="bg-muted px-2 py-1 rounded">{param.name}</code>
                                    <Badge variant="outline">{param.type}</Badge>
                                    <span className="text-muted-foreground">{param.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold mb-2">Réponse (200 OK)</h4>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{endpoint.response}</code>
                            </pre>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="passengers" className="space-y-4 mt-6">
                {endpoints
                  .filter((e) => e.path.includes("/passengers"))
                  .map((endpoint) => (
                    <Card key={endpoint.id} className="border-l-4 border-l-primary">
                      <CardHeader
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleEndpoint(endpoint.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getMethodColor(endpoint.method)} text-white font-mono`}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono">{endpoint.path}</code>
                          </div>
                          {expandedEndpoint === endpoint.id ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                        <CardDescription className="mt-2">{endpoint.summary}</CardDescription>
                      </CardHeader>

                      {expandedEndpoint === endpoint.id && (
                        <CardContent className="space-y-4 pt-0">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Réponse (200 OK)</h4>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{endpoint.response}</code>
                            </pre>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Exemples de code</CardTitle>
            <CardDescription>Comment utiliser l'API dans différents langages</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript" className="w-full">
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>

              <TabsContent value="javascript" className="mt-4">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`// Créer une demande de ramassage
const response = await fetch('/api/v1/rides', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    pickup_lat: 48.8566,
    pickup_lng: 2.3522,
    pickup_address: '123 Rue de la Paix, Paris'
  })
});

const data = await response.json();
console.log(data);`}</code>
                </pre>
              </TabsContent>

              <TabsContent value="python" className="mt-4">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`import requests

# Créer une demande de ramassage
response = requests.post(
    'https://buspickup.vercel.app/api/v1/rides',
    json={
        'pickup_lat': 48.8566,
        'pickup_lng': 2.3522,
        'pickup_address': '123 Rue de la Paix, Paris'
    }
)

data = response.json()
print(data)`}</code>
                </pre>
              </TabsContent>

              <TabsContent value="curl" className="mt-4">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`# Créer une demande de ramassage
curl -X POST https://buspickup.vercel.app/api/v1/rides \\
  -H "Content-Type: application/json" \\
  -d '{
    "pickup_lat": 48.8566,
    "pickup_lng": 2.3522,
    "pickup_address": "123 Rue de la Paix, Paris"
  }'`}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
