import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()
    
    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
      authenticated: true,
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Session check failed" }, { status: 500 })
  }
}
