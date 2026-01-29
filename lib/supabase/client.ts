import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.BUS_PICKUP_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.BUS_PICKUP_PUBLIC_SUPABASE_ANON_KEY

  // Ne pas lancer d'erreur si les variables ne sont pas définies (build time)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase client env vars not available")
    return null as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
