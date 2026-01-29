import { cookies } from "next/headers"
import { query, userRepository, type User, type Session } from "./db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

const SESSION_COOKIE_NAME = "session_token"
const SESSION_DURATION_DAYS = 30

// Hasher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Vérifier un mot de passe
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Créer une session
export async function createSession(userId: string): Promise<Session> {
  const token = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  const result = await query<Session>(
    `INSERT INTO sessions (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, token, expiresAt]
  )

  // Définir le cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return result.rows[0]
}

// Obtenir la session actuelle
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  const result = await query<Session>(
    `SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()`,
    [token]
  )

  return result.rows[0] || null
}

// Obtenir l'utilisateur actuel
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null

  return userRepository.findById(session.user_id)
}

// Supprimer la session (déconnexion)
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await query("DELETE FROM sessions WHERE token = $1", [token])
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

// Connexion
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User; session: Session } | null> {
  const user = await userRepository.findByEmail(email)
  if (!user) return null

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) return null

  const session = await createSession(user.id)
  return { user, session }
}

// Inscription
export async function signUp(data: {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
}): Promise<{ user: User; session: Session }> {
  const passwordHash = await hashPassword(data.password)

  const user = await userRepository.create({
    email: data.email,
    password_hash: passwordHash,
    first_name: data.firstName,
    last_name: data.lastName,
    phone: data.phone,
    role: "passenger",
  })

  const session = await createSession(user.id)
  return { user, session }
}

// Créer un token de réinitialisation de mot de passe
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await userRepository.findByEmail(email)
  if (!user) return null

  const token = uuidv4()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // Expire dans 1 heure

  await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, token, expiresAt]
  )

  return token
}

// Réinitialiser le mot de passe
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const result = await query<{ user_id: string }>(
    `SELECT user_id FROM password_reset_tokens 
     WHERE token = $1 AND expires_at > NOW() AND used = false`,
    [token]
  )

  if (result.rows.length === 0) return false

  const userId = result.rows[0].user_id
  const passwordHash = await hashPassword(newPassword)

  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, userId])
  await query("UPDATE password_reset_tokens SET used = true WHERE token = $1", [token])

  return true
}

// Changer le mot de passe
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const user = await userRepository.findById(userId)
  if (!user) return false

  const isValid = await verifyPassword(currentPassword, user.password_hash)
  if (!isValid) return false

  const passwordHash = await hashPassword(newPassword)
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, userId])

  return true
}

// Vérifier si l'utilisateur est admin
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === "admin"
}

// Vérifier si l'utilisateur est chauffeur
export async function isDriver(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === "driver"
}

// Middleware d'authentification pour les API
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Non authentifié")
  }
  return user
}

// Middleware pour vérifier le rôle admin
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin") {
    throw new Error("Accès non autorisé")
  }
  return user
}
