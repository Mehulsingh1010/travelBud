import { verifySession } from "@/lib/auth/session"
import { redirect } from "next/navigation"

export default async function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return <>{children}</>
}
