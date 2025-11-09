let Pool: any
const pool: any = null
const dbError = "PostgreSQL driver not available. Please clone and run locally or use Supabase."

// Helper function for parameterized queries
export async function query<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
  console.warn("[v0] Database not available:", dbError)
  return []
}

// Helper function for single row queries
export async function queryOne<T = any>(sqlQuery: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(sqlQuery, params)
  return results[0] || null
}

// Export error status
export { dbError }
