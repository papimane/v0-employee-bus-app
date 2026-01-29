import { Pool, PoolClient } from "pg"

// Configuration du pool de connexions PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Types pour les résultats de requêtes
export interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
}

// Fonction pour exécuter une requête
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("[DB] Query executed", { text: text.substring(0, 50), duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error("[DB] Query error", { text: text.substring(0, 50), error })
    throw error
  }
}

// Fonction pour obtenir un client du pool (pour les transactions)
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect()
  return client
}

// Fonction pour exécuter une transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

// Fonction utilitaire pour échapper les valeurs
export function escape(value: string): string {
  return value.replace(/'/g, "''")
}

// Types pour les modèles
export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  role: "passenger" | "driver" | "admin"
  is_active: boolean
  email_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface Driver {
  id: string
  user_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  license_number: string
  photo_url: string | null
  is_active: boolean
  is_account_activated: boolean
  created_at: Date
  updated_at: Date
}

export interface Bus {
  id: string
  brand: string
  model: string
  plate_number: string
  capacity: number
  driver_id: string | null
  is_active: boolean
  current_lat: number | null
  current_lng: number | null
  created_at: Date
  updated_at: Date
}

export interface RideRequest {
  id: string
  passenger_id: string
  driver_id: string | null
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled"
  pickup_lat: number
  pickup_lng: number
  pickup_address: string | null
  destination_lat: number | null
  destination_lng: number | null
  destination_address: string | null
  accepted_at: Date | null
  completed_at: Date | null
  cancelled_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
}

// Repository pour les utilisateurs
export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const result = await query<User>("SELECT * FROM users WHERE id = $1", [id])
    return result.rows[0] || null
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>("SELECT * FROM users WHERE email = $1", [email])
    return result.rows[0] || null
  },

  async create(user: Partial<User>): Promise<User> {
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user.email, user.password_hash, user.first_name, user.last_name, user.phone, user.role || "passenger"]
    )
    return result.rows[0]
  },

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== "id") {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query<User>(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0] || null
  },

  async delete(id: string): Promise<boolean> {
    const result = await query("DELETE FROM users WHERE id = $1", [id])
    return result.rowCount > 0
  },

  async findAll(filters?: { role?: string; is_active?: boolean }): Promise<User[]> {
    let sql = "SELECT * FROM users WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (filters?.role) {
      sql += ` AND role = $${paramIndex}`
      params.push(filters.role)
      paramIndex++
    }
    if (filters?.is_active !== undefined) {
      sql += ` AND is_active = $${paramIndex}`
      params.push(filters.is_active)
    }

    sql += " ORDER BY created_at DESC"
    const result = await query<User>(sql, params)
    return result.rows
  },
}

// Repository pour les demandes de ramassage
export const rideRequestRepository = {
  async findById(id: string): Promise<RideRequest | null> {
    const result = await query<RideRequest>("SELECT * FROM ride_requests WHERE id = $1", [id])
    return result.rows[0] || null
  },

  async findByPassengerId(passengerId: string, status?: string[]): Promise<RideRequest[]> {
    let sql = "SELECT * FROM ride_requests WHERE passenger_id = $1"
    const params: any[] = [passengerId]

    if (status && status.length > 0) {
      sql += ` AND status = ANY($2)`
      params.push(status)
    }

    sql += " ORDER BY created_at DESC"
    const result = await query<RideRequest>(sql, params)
    return result.rows
  },

  async findPending(): Promise<RideRequest[]> {
    const result = await query<RideRequest>(
      `SELECT rr.*, u.first_name as passenger_first_name, u.last_name as passenger_last_name, u.avatar_url as passenger_avatar
       FROM ride_requests rr
       JOIN users u ON rr.passenger_id = u.id
       WHERE rr.status = 'pending'
       ORDER BY rr.created_at ASC`
    )
    return result.rows
  },

  async create(request: Partial<RideRequest>): Promise<RideRequest> {
    const result = await query<RideRequest>(
      `INSERT INTO ride_requests (passenger_id, pickup_lat, pickup_lng, pickup_address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [request.passenger_id, request.pickup_lat, request.pickup_lng, request.pickup_address]
    )
    return result.rows[0]
  },

  async accept(id: string, driverId: string): Promise<RideRequest | null> {
    const result = await query<RideRequest>(
      `UPDATE ride_requests 
       SET status = 'accepted', driver_id = $2, accepted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id, driverId]
    )
    return result.rows[0] || null
  },

  async cancel(id: string, passengerId: string): Promise<RideRequest | null> {
    const result = await query<RideRequest>(
      `UPDATE ride_requests 
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND passenger_id = $2 AND status IN ('pending', 'accepted')
       RETURNING *`,
      [id, passengerId]
    )
    return result.rows[0] || null
  },

  async complete(id: string): Promise<RideRequest | null> {
    const result = await query<RideRequest>(
      `UPDATE ride_requests 
       SET status = 'completed', completed_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status IN ('accepted', 'in_progress')
       RETURNING *`,
      [id]
    )
    return result.rows[0] || null
  },
}

// Repository pour les chauffeurs
export const driverRepository = {
  async findById(id: string): Promise<Driver | null> {
    const result = await query<Driver>("SELECT * FROM drivers WHERE id = $1", [id])
    return result.rows[0] || null
  },

  async findByUserId(userId: string): Promise<Driver | null> {
    const result = await query<Driver>("SELECT * FROM drivers WHERE user_id = $1", [userId])
    return result.rows[0] || null
  },

  async findAll(): Promise<Driver[]> {
    const result = await query<Driver>("SELECT * FROM drivers ORDER BY created_at DESC")
    return result.rows
  },

  async create(driver: Partial<Driver>): Promise<Driver> {
    const result = await query<Driver>(
      `INSERT INTO drivers (user_id, first_name, last_name, email, phone, license_number, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [driver.user_id, driver.first_name, driver.last_name, driver.email, driver.phone, driver.license_number, driver.photo_url]
    )
    return result.rows[0]
  },

  async update(id: string, data: Partial<Driver>): Promise<Driver | null> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== "id") {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query<Driver>(
      `UPDATE drivers SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0] || null
  },

  async delete(id: string): Promise<boolean> {
    const result = await query("DELETE FROM drivers WHERE id = $1", [id])
    return result.rowCount > 0
  },
}

// Repository pour les bus
export const busRepository = {
  async findById(id: string): Promise<Bus | null> {
    const result = await query<Bus>("SELECT * FROM buses WHERE id = $1", [id])
    return result.rows[0] || null
  },

  async findAll(): Promise<Bus[]> {
    const result = await query<Bus>(
      `SELECT b.*, d.first_name as driver_first_name, d.last_name as driver_last_name
       FROM buses b
       LEFT JOIN drivers d ON b.driver_id = d.id
       ORDER BY b.created_at DESC`
    )
    return result.rows
  },

  async create(bus: Partial<Bus>): Promise<Bus> {
    const result = await query<Bus>(
      `INSERT INTO buses (brand, model, plate_number, capacity, driver_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [bus.brand, bus.model, bus.plate_number, bus.capacity, bus.driver_id]
    )
    return result.rows[0]
  },

  async update(id: string, data: Partial<Bus>): Promise<Bus | null> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== "id") {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    if (fields.length === 0) return null

    values.push(id)
    const result = await query<Bus>(
      `UPDATE buses SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0] || null
  },

  async delete(id: string): Promise<boolean> {
    const result = await query("DELETE FROM buses WHERE id = $1", [id])
    return result.rowCount > 0
  },

  async updateLocation(id: string, lat: number, lng: number): Promise<Bus | null> {
    const result = await query<Bus>(
      `UPDATE buses SET current_lat = $2, current_lng = $3 WHERE id = $1 RETURNING *`,
      [id, lat, lng]
    )
    return result.rows[0] || null
  },
}

export default pool
