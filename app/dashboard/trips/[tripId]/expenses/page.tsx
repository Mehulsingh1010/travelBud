// app/dashboard/trips/[tripId]/expenses/page.tsx

import { db } from "@/lib/db"
import { trips, users, tripMembers } from "@/lib/db/schema"
import { expenses } from "@/lib/db/payments/expenses"
import { settlements } from "@/lib/db/payments/settlements"
import { eq, desc } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { notFound } from "next/navigation"
import { verifySession } from "@/lib/auth/session"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/expenses/formatCurrency"
import { getBalances } from "@/lib/expenses/getBalance"
import SettleUpCard from "@/components/expenses/SettleUpCard"
import RecentActivityClient from "@/components/expenses/RecentActivityClient"
import { inArray, and } from "drizzle-orm"
import { expenseSplits, expensePayers } from "@/lib/db/payments"
import React from "react"


// ---------- TYPES ----------
type RecentExpense = {
  type: "expense"
  id: number
  title: string
  expenseDate: Date
  amountConverted: number
  createdAt: Date | null
  myShare?: number
}

type RecentSettlement = {
  type: "settlement"
  id: number
  fromUserId: number
  toUserId: number
  amount: number
  currency: string
  createdAt: Date | null
  fromName?: string | null
  toName?: string | null
}

export async function getRecentSettlements(tripId: number) {
  const uf = alias(users, "from_user")
  const ut = alias(users, "to_user")

  return db
    .select({
      id: settlements.id,
      fromUserId: settlements.fromUserId,
      toUserId: settlements.toUserId,
      amount: settlements.amount,
      currency: settlements.currency,
      createdAt: settlements.createdAt,
      fromName: uf.name,
      toName: ut.name,
    })
    .from(settlements)
    .leftJoin(uf, eq(uf.id, settlements.fromUserId))
    .leftJoin(ut, eq(ut.id, settlements.toUserId))
    .where(eq(settlements.tripId, tripId))
    .orderBy(desc(settlements.createdAt))
    .limit(10)
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

  const membership = await db.query.tripMembers.findFirst({
    where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, session.userId)),
  })
  const userRole = membership?.role ?? "member"

  // Recent expenses
  const recentExpenses = await db
    .select()
    .from(expenses)
    .where(eq(expenses.tripId, tripId))
    .orderBy(desc(expenses.createdAt))
    .limit(10)
    
      // Recent settlements WITH names
  const recentExpenseIds = recentExpenses.map((e) => e.id)

  // fetch split rows for current user for these recent expenses
  const mySplitRows = recentExpenseIds.length
    ? await db.query.expenseSplits.findMany({
        where: and(inArray(expenseSplits.expenseId, recentExpenseIds), eq(expenseSplits.userId, session.userId)),
      })
    : []

  // NEW: fetch payer rows for current user for these recent expenses (how much the user actually paid)
  const myPayerRows = recentExpenseIds.length
    ? await db.query.expensePayers.findMany({
        where: and(inArray(expensePayers.expenseId, recentExpenseIds), eq(expensePayers.userId, session.userId)),
      })
    : []

  // map expenseId -> my share (amountOwed in smallest unit)
  const myShareMap = new Map<number, number>()
  for (const s of mySplitRows) {
    myShareMap.set(s.expenseId, Number(s.amountOwed))
  }

  // map expenseId -> my paid amount (amount in smallest unit)
  const myPaidMap = new Map<number, number>()
  for (const p of myPayerRows) {
    myPaidMap.set(p.expenseId, Number(p.amount))
  }

  // Recent settlements we already fetched (getRecentSettlements or however you had it)
  const recentSettlements = await getRecentSettlements(tripId)

  // Build recentActivity carrying myShare and myPaid through
  const recentActivity: (RecentExpense | RecentSettlement)[] = [
    ...recentExpenses.map((e) => ({
      type: "expense" as const,
      id: e.id,
      title: e.title,
      expenseDate: e.expenseDate,
      amountConverted: e.amountConverted,
      createdAt: e.createdAt,
      myShare: myShareMap.get(e.id) ?? 0, // in smallest unit
      myPaid: myPaidMap.get(e.id) ?? 0,   // in smallest unit
    })),
    ...recentSettlements.map((s) => ({
      type: "settlement" as const,
      id: s.id,
      fromUserId: s.fromUserId,
      toUserId: s.toUserId,
      amount: s.amount,
      currency: s.currency,
      createdAt: s.createdAt,
      fromName: s.fromName,
      toName: s.toName,
    })),
  ]
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
    .slice(0, 10)

  // Build client-friendly items (strings instead of Date objects) and include myShare/myPaid
  const clientItems = recentActivity.map((it) => {
    if (it.type === "expense") {
      return {
        kind: "expense" as const,
        id: it.id,
        title: it.title,
        expenseDateISO: (it.expenseDate instanceof Date ? it.expenseDate : new Date(it.expenseDate)).toISOString(),
        amountConverted: it.amountConverted,
        myShare: (it as any).myShare ?? 0,
        myPaid: (it as any).myPaid ?? 0,
      }
    } else {
      const fromLabel = (it as any).fromName ?? `User ${(it as any).fromUserId}`
      const toLabel = (it as any).toName ?? `User ${(it as any).toUserId}`
      return {
        kind: "settlement" as const,
        id: it.id,
        fromLabel,
        toLabel,
        amount: (it as any).amount,
        currency: (it as any).currency,
        createdAtISO: (it as any).createdAt ? (it as any).createdAt.toISOString() : null,
      }
    }
  })
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

      {/* Minimal transfers summary — single-state view */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Your Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(balances.recommendations) && balances.recommendations.length > 0 ? (
            (() => {
              // maps for display names/avatars from per_user (fallback)
              const nameMap = new Map<number, string>()
              const avatarMap = new Map<number, string | undefined>()
              if (Array.isArray(balances.per_user)) {
                for (const pu of balances.per_user) {
                  nameMap.set(pu.user_id, pu.name)
                  avatarMap.set(pu.user_id, pu.avatar_url ?? undefined)
                }
              }
            
              const recs = balances.recommendations as { fromUserId: number; toUserId: number; amount: number }[]
            
              // outgoing: you should pay them
              const outgoing = recs.filter((r) => r.fromUserId === session.userId)
              // incoming: they should pay you
              const incoming = recs.filter((r) => r.toUserId === session.userId)
            
              const outgoingTotal = outgoing.reduce((s, r) => s + r.amount, 0)
              const incomingTotal = incoming.reduce((s, r) => s + r.amount, 0)
            
              // decide which single state to show based on net (robust if recommendations contain both)
              if (balances.net < 0 && outgoingTotal > 0) {
                // you owe
                return (
                  <div>
                    <h4 className="text-sm font-medium mb-2">You need to pay</h4>
                    <div className="mb-3 text-sm text-slate-600">
                      Total: <span className="font-semibold text-red-600">-{formatCurrency(Math.abs(outgoingTotal), currency)}</span>
                    </div>
                
                    <ul className="space-y-2">
                      {outgoing.map((r, idx) => {
                        const otherId = r.toUserId
                        const otherName = nameMap.get(otherId) ?? `User ${otherId}`
                        const otherAvatar = avatarMap.get(otherId)
                        return (
                          <React.Fragment key={`out-${otherId}`}>
                          <li className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {otherAvatar ? (
                                <img src={otherAvatar} alt={otherName} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold">
                                  {otherName?.charAt(0)?.toUpperCase?.() ?? "U"}
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium">{otherName}</div>
                                <div className="text-xs text-slate-500">Settle this person directly</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-red-600">
                                -{formatCurrency(r.amount, currency)}
                              </div>
                            
                              <SettleUpCard
                                tripId={tripId}
                                currentUser={{ id: session.userId, name: session.name || "You" }}
                                counterparty={{
                                  id: otherId,
                                  name: otherName,
                                  amountOwed: r.amount,
                                  currency,
                                }}
                                trigger={
                                  <Button size="sm" variant="secondary" className="bg-blue-100 text-blue-700">
                                    Settle up →
                                  </Button>
                                }
                              />
                            </div>
                          </li>
                          {idx < outgoing.length - 1 && (
                            <div
                            role="separator"
                            aria-hidden
                            className="h-px bg-gradient-to-r from-transparent via-slate-300 to =-transparent my-2"
                            />
                        )}
                        </React.Fragment>
                        )
                      })}
                    </ul>
                  </div>
                )
              } else if (balances.net > 0 && incomingTotal > 0) {
                // you are owed
                return (
                  <div>
                    <h4 className="text-sm font-medium mb-2">People who should pay you</h4>
                    <div className="mb-3 text-sm text-slate-600">
                      Total: <span className="font-semibold text-green-600">+{formatCurrency(incomingTotal, currency)}</span>
                    </div>
                
                    <ul className="space-y-2">
                      {incoming.map((r, idx) => {
                        const otherId = r.fromUserId
                        const otherName = nameMap.get(otherId) ?? `User ${otherId}`
                        const otherAvatar = avatarMap.get(otherId)
                        return (
                          <React.Fragment key={`in-${otherId}`}>
                          <li className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {otherAvatar ? (
                                <img src={otherAvatar} alt={otherName} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold">
                                  {otherName?.charAt(0)?.toUpperCase?.() ?? "U"}
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium">{otherName}</div>
                                <div className="text-xs text-slate-500">They should pay you</div>
                              </div>
                            </div>
                            
                            <div className="text-sm font-medium text-green-600">
                              +{formatCurrency(r.amount, currency)}
                            </div>
                          </li>
                          {idx < incoming.length - 1 && (
                            <div
                            role="separator"
                            aria-hidden
                            className="h-px bg-gradient-to-r from-transparent via-slate-300 to =-transparent my-2"
                            />
                          )}
                        </React.Fragment>
                      )
                    })}
                  </ul>
                </div>
                )
              } else {
                // nothing to show (settled) — do not show empty sections
                return (
                  <div className="text-center py-6">
                    <div className="text-lg font-semibold text-slate-700">You are Settled!!</div>
                    <div className="text-xs text-slate-500 mt-1">No minimal transfers at this time.</div>
                  </div>
                )
              }
            })()
          ) : (
            // Fallback: legacy per_user view (if recommendations not returned)
            <>
              {balances.per_user.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {balances.per_user.slice(0, 3).map((cp) => {
                    const iOweThem = cp.amount < 0
                    return (
                      <li key={cp.user_id} className="grid grid-cols-3 items-center gap-4 py-3">
                        <span className="text-left font-medium">{cp.name}</span>
                        <div className="flex justify-center">
                          {iOweThem ? (
                            <SettleUpCard
                              tripId={tripId}
                              currentUser={{ id: session.userId, name: session.name || "You" }}
                              counterparty={{
                                id: cp.user_id,
                                name: cp.name,
                                amountOwed: Math.abs(cp.amount),
                                currency,
                              }}
                              trigger={
                                <Button size="sm" variant="secondary" className="bg-blue-100 text-blue-700">
                                  Settle up →
                                </Button>
                              }
                            />
                          ) : (
                            <span className="h-6" />
                          )}
                        </div>
                        <span className={`text-right ${cp.amount > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}`}>
                          {cp.amount > 0 ? "+" : "-"}
                          {formatCurrency(Math.abs(cp.amount), currency)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No outstanding balances</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {clientItems.length > 0 ? (
            <RecentActivityClient
              items={clientItems}
              currency={currency}
              tripId={tripId}
              currentUser={{ id: session.userId, name: session.name || "You" }}
              userRole={userRole}
            />
          ) : (
            <p className="text-sm text-slate-500">No recent activity</p>
          )}
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