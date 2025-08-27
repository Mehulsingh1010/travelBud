
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.SESSION_SECRET || "fallback-secret-key"
const encodedKey = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  userId: number
  email: string
  name: string
  role: string
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload as SessionPayload
  } catch (error) {
    console.log("Failed to verify session")
    return null
  }
}

export async function createSession(userId: number, email: string, name: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, email, name, role, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })

  return session
}

export async function verifySession() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return null
  }

  return { userId: session.userId, email: session.email, name: session.name, role: session.role }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
