const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")

async function migrate() {
  if (!process.env.POSTGRES_URL) {
    console.log("POSTGRES_URL not set, skipping migration...")
    return
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log("Starting database migration...")

    // Lire le fichier SQL - essayer plusieurs chemins possibles
    const possiblePaths = [
      path.join(__dirname, "setup-database.sql"),
      path.join(process.cwd(), "scripts", "setup-database.sql"),
      path.resolve("scripts/setup-database.sql"),
    ]

    let sql = null
    let usedPath = null
    for (const sqlPath of possiblePaths) {
      if (fs.existsSync(sqlPath)) {
        sql = fs.readFileSync(sqlPath, "utf8")
        usedPath = sqlPath
        break
      }
    }

    if (!sql) {
      console.log("setup-database.sql not found, skipping migration...")
      return
    }

    console.log("Using SQL file:", usedPath)

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
