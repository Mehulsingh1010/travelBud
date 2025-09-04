// app/dashboard/trips/[tripId]/expenses/page.tsx

import { db } from "@/lib/db"
import { trips, users } from "@/lib/db/schema"
import { expenses } from "@/lib/db/payments/expenses"
import { settlements } from "@/lib/db/payments/settlements"
import { eq, desc } from "drizzle-orm"
import { notFound } from "next/navigation"
import { verifySession } from "@/lib/auth/session"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/expenses/formatCurrency"
import { getBalances } from "@/lib/expenses/getBalance"

// ---------- TYPES ----------
type RecentExpense = {
  type: "expense"
  id: number
  title: string
  expenseDate: Date
  amountConverted: number
  createdAt: Date | null
}

type RecentSettlement = {
  type: "settlement"
  id: number
  fromUserId: number
  toUserId: number
  amount: number
  currency: string
  createdAt: Date | null
}

type RecentActivity = RecentExpense | RecentSettlement

// ---------- PAGE ----------
export default async function ExpensesPage({
  params,
}: {
  params: { tripId: string }
}) {
  const session = await verifySession()
  if (!session) return notFound()

  const tripId = Number(params.tripId)

  // Fetch trip
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  })
  if (!trip) return notFound()

  // Get balances
  const balances = await getBalances(tripId, session.userId)
  const net = balances.net
  const currency = balances.currency

  // Recent expenses
  const recentExpenses = await db
    .select()
    .from(expenses)
    .where(eq(expenses.tripId, tripId))
    .orderBy(desc(expenses.createdAt))
    .limit(10)

  // Recent settlements
  const recentSettlements = await db
    .select()
    .from(settlements)
    .where(eq(settlements.tripId, tripId))
    .orderBy(desc(settlements.createdAt))
    .limit(10)

  // Merge + sort activity
  const recentActivity: RecentActivity[] = [
    ...recentExpenses.map((e) => ({
      type: "expense" as const,
      id: e.id,
      title: e.title,
      expenseDate: e.expenseDate,
      amountConverted: e.amountConverted,
      createdAt: e.createdAt,
    })),
    ...recentSettlements.map((s) => ({
      type: "settlement" as const,
      id: s.id,
      fromUserId: s.fromUserId,
      toUserId: s.toUserId,
      amount: s.amount,
      currency: s.currency,
      createdAt: s.createdAt,
    })),
  ]
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
    .slice(0, 10)

  // Net balance UI
  const netDisplay =
    net === 0
      ? "You are Settled!!"
      : `${net > 0 ? "+" : "-"}${formatCurrency(Math.abs(net), currency)}`
  const netClass =
    net > 0 ? "text-green-600" : net < 0 ? "text-red-600" : "text-slate-500"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-xl font-semibold text-slate-900">
        Expense Manager
      </h1>
      <h2 className="text-3xl font-bold text-slate-900">{trip.name}</h2>

      {/* Net balance */}
      <div className={`text-2xl font-bold mb-4 ${netClass}`}>{netDisplay}</div>

      {/* TODO: Balances per user list + settle up buttons */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>People you owe / who owe you</CardTitle>
        </CardHeader>
        <CardContent>
          {balances.per_user.length > 0 ? (
            <ul className="space-y-2">
              {balances.per_user.slice(0, 3).map((cp, idx) => (
                <div key={cp.user_id}>
                  <li className="grid grid-cols-3 items-center gap-4 py-2">
                    {/* Left: name */}
                    <span className="text-left">{cp.name}</span>
            
                    {/* Middle: button */}
                    <div className="flex justify-center">
                      {cp.amount < 0 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-blue-100 text-blue-700"
                        >
                          Settle up →
                        </Button>
                      )}
                    </div>
                  
                    {/* Right: amount */}
                    <span
                      className={`text-right ${
                        cp.amount > 0
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }`}
                    >
                      {cp.amount > 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(cp.amount), currency)}
                    </span>
                  </li>
                  
                  {/* Divider line (skip last item) */}
                  {idx < balances.per_user.slice(0, 3).length - 1 && (
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent my-1" />
                  )}
                </div>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No outstanding balances</p>
          )}

          {balances.per_user.length > 3 && (
            <div className="mt-3 text-right">
              <Button variant="outline" size="sm">
                View More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) =>
                item.type === "expense" ? (
                  <Card
                    key={`exp-${item.id}`}
                    className="p-4 flex justify-between items-center hover:shadow-md transition"
                  >
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(item.expenseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        Your share: (pending calc)
                      </p>
                      <p className="text-sm text-slate-500">
                        Total: {formatCurrency(item.amountConverted, currency)}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card
                    key={`set-${item.id}`}
                    className="p-4 bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white"
                  >
                    <p className="text-sm font-medium">
                      Settlement: User {item.fromUserId} paid User{" "}
                      {item.toUserId}{" "}
                      {formatCurrency(item.amount, item.currency)}
                    </p>
                  </Card>
                )
              )
            ) : (
              <p className="text-sm text-slate-500">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
        {/* Floating Add Expense Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Link href={`/dashboard/trips/${tripId}/expenses/new`}>
            <Button
              className="bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white shadow-xl rounded-full px-8 py-6 flex items-center gap-3 hover:scale-110 transition-transform text-lg"
            >
              <span className="text-4xl font-bold">+</span>
              Add Expense
            </Button>
          </Link>
        </div>
    </div>
  )
}