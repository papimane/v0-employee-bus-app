import { NextResponse } from "next/server"
import { createActiveDriver } from "@/app/actions/driver-actions"

// Cette route doit être supprimée en production
export async function POST() {
  const result = await createActiveDriver(
    "chauffeur.test@buspickup.com",
    "Chauffeur2024!",
    "Jean",
    "Dupont",
    "+221771234567",
    "DL987654321",
  )

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: "Chauffeur créé avec succès",
      credentials: {
        email: result.email,
        password: result.password,
      },
    })
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: 500 },
    )
  }
}
