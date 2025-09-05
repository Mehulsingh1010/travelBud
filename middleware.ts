import { type NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/lib/auth/session"
import { cookies } from "next/headers"

// Define protected and public routes
const protectedRoutes = ["/dashboard", "/trips", "/profile"]
const publicRoutes = ["/login", "/signup", "/"]

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  // Get session from cookie
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value
  const session = await decrypt(cookie)

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // Redirect to dashboard if accessing public route with valid session
  if (isPublicRoute && session?.userId && !req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
