import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Creating Supabase client with URL:", supabaseUrl ? "✓" : "✗")
  console.log("[v0] Creating Supabase client with Key:", supabaseAnonKey ? "✓" : "✗")

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables: SUPABASE_URL or SUPABASE_ANON_KEY")
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Appelé depuis un Server Component, ignoré si middleware rafraîchit les sessions
        }
      },
    },
  })
}

export async function createAdminClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("[v0] Creating Admin Supabase client with URL:", supabaseUrl ? "✓" : "✗")
  console.log("[v0] Creating Admin Supabase client with Service Role Key:", supabaseServiceRoleKey ? "✓" : "✗")

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Appelé depuis un Server Component, ignoré si middleware rafraîchit les sessions
        }
      },
    },
  })
}
