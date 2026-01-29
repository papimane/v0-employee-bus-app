"use server"

import { query } from "@/lib/db"

export interface Passenger {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export async function getPassengers(): Promise<Passenger[]> {
  const result = await query(
    `SELECT id, email, 
            COALESCE(SPLIT_PART(full_name, ' ', 1), '') as first_name,
            COALESCE(SPLIT_PART(full_name, ' ', 2), '') as last_name,
            phone, avatar_url, created_at 
     FROM users 
     WHERE role = 'passenger' 
     ORDER BY created_at DESC`
  )
  return result.rows
}

export async function updatePassenger(
  id: string,
  data: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const fullName = `${data.first_name} ${data.last_name}`.trim()
    await query(
      `UPDATE users 
       SET full_name = $1, phone = $2, updated_at = NOW() 
       WHERE id = $3`,
      [fullName, data.phone, id]
    )
    return { success: true }
  } catch (error) {
    console.error("Error updating passenger:", error)
    return { success: false, error: "Failed to update passenger" }
  }
}

export async function deletePassenger(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await query("DELETE FROM users WHERE id = $1", [id])
    return { success: true }
  } catch (error) {
    console.error("Error deleting passenger:", error)
    return { success: false, error: "Failed to delete passenger" }
  }
}
