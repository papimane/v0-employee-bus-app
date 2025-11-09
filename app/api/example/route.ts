import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Example GET endpoint - Fetch data
export async function GET() {
  try {
    // Example: Get all employees
    const employees = await query("SELECT * FROM employees ORDER BY created_at DESC LIMIT 10")

    return NextResponse.json({
      success: true,
      data: employees,
    })
  } catch (error) {
    console.error("[v0] Error fetching employees:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 })
  }
}

// Example POST endpoint - Create data
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email } = body

    // Example: Insert new employee
    const result = await query("INSERT INTO employees (name, email, created_at) VALUES ($1, $2, NOW()) RETURNING *", [
      name,
      email,
    ])

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error creating employee:", error)
    return NextResponse.json({ success: false, error: "Failed to create employee" }, { status: 500 })
  }
}
