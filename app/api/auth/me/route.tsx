// app/api/auth/me/route.ts
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role
      }
    })
  } catch (error) {
    console.error("Error getting user session:", error)
    return NextResponse.json(
      { error: "Failed to get user session" }, 
      { status: 500 }
    )
  }
}