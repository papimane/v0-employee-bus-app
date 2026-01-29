const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log("Starting database migration...")

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, "setup-database.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    // Executer le script SQL
    await pool.query(sql)

    console.log("Database migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error.message)
    // Ne pas faire echouer le build si la migration a des erreurs de duplication
    if (!error.message.includes("already exists") && !error.message.includes("duplicate")) {
      process.exit(1)
    }
    console.log("Some objects already exist, continuing...")
  } finally {
    await pool.end()
  }
}

migrate()
