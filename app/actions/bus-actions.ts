"use server"

import { query } from "@/lib/db"

export interface BusType {
  id: string
  brand: string
  model: string
  license_plate: string
  capacity: number
  driver_id: string | null
  is_active: boolean
  created_at: string
}

export async function getBuses(): Promise<BusType[]> {
  const result = await query(
    `SELECT * FROM buses ORDER BY created_at DESC`
  )
  return result.rows
}

export async function createBus(data: {
  brand: string
  model: string
  license_plate: string
  capacity: number
  driver_id: string | null
}): Promise<{ success: boolean; error?: string; bus?: BusType }> {
  try {
    const result = await query(
      `INSERT INTO buses (brand, model, license_plate, capacity, driver_id, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [data.brand, data.model, data.license_plate, data.capacity, data.driver_id]
    )
    return { success: true, bus: result.rows[0] }
  } catch (error) {
    console.error("Error creating bus:", error)
    return { success: false, error: "Failed to create bus" }
  }
}

export async function updateBus(
  id: string,
  data: {
    brand: string
    model: string
    license_plate: string
    capacity: number
    driver_id: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await query(
      `UPDATE buses 
       SET brand = $1, model = $2, license_plate = $3, capacity = $4, driver_id = $5, updated_at = NOW()
       WHERE id = $6`,
      [data.brand, data.model, data.license_plate, data.capacity, data.driver_id, id]
    )
    return { success: true }
  } catch (error) {
    console.error("Error updating bus:", error)
    return { success: false, error: "Failed to update bus" }
  }
}

export async function deleteBus(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await query("DELETE FROM buses WHERE id = $1", [id])
    return { success: true }
  } catch (error) {
    console.error("Error deleting bus:", error)
    return { success: false, error: "Failed to delete bus" }
  }
}
