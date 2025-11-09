let Pool: any
let pool: any = null
let dbError: string | null = null

try {
  // Tentative d'import du driver pg (ne fonctionnera pas dans v0)
  const pg = require("pg")
  Pool = pg.Pool

  // Création du pool uniquement si l'import a réussi
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  })
} catch (error) {
  // Dans l'environnement v0, le driver natif 'pg' n'est pas disponible
  dbError = "PostgreSQL driver not available in v0 environment. Please clone and run locally."
  console.warn("[v0] PostgreSQL native driver not available:", error)
}

// Helper function for parameterized queries
export async function query<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
  if (dbError || !pool) {
    console.warn("[v0] Database not available:", dbError)
    return []
  }

  const client = await pool.connect()
  try {
    const result = await client.query(sqlQuery, params)
    return result.rows as T[]
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  } finally {
    client.release()
  }
}

// Helper function for single row queries
export async function queryOne<T = any>(sqlQuery: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(sqlQuery, params)
  return results[0] || null
}

// Export pool and error status for advanced usage
export { pool, dbError }
