// app/dashboard/trips/[tripId]/expenses/new/page.tsx
import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { trips, tripMembers, users } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { verifySession } from "@/lib/auth/session"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AddExpenseForm from "@/components/expenses/AddExpenseForm"

export default async function AddExpensePage({
  params,
}: {
  params: { tripId: string }
}) {
  const session = await verifySession()
  if (!session) redirect("/login")

  const tripId = Number(params.tripId)

  const trip = await db.query.trips.findFirst({ where: eq(trips.id, tripId) })
  if (!trip) notFound()

  const membership = await db
    .select()
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, session.userId)))
    .limit(1)
  if (membership.length === 0) redirect("/dashboard")

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      joinedAt: tripMembers.joinedAt,
    })
    .from(tripMembers)
    .innerJoin(users, eq(tripMembers.userId, users.id))
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.status, "approved")))
    .orderBy(desc(tripMembers.joinedAt))

  const baseCurrency = (trip.baseCurrency as string) || "INR"

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle className="text-2xl">Expense Manager</CardTitle>
                <Badge variant="outline" className="text-xs">New Expense</Badge>
              </div>
              <CardDescription className="text-slate-600">
                Add a new expense for <span className="font-medium text-slate-900">{trip.name}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <AddExpenseForm
        tripId={tripId}
        currentUserId={session.userId}
        baseCurrency={baseCurrency}
        members={members.map((m) => ({ id: m.id, name: m.name }))}
      />
    </div>
  )
}