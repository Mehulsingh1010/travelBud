// lib/expenses/getBalances.ts
import { db } from "@/lib/db"
import { expenses, expensePayers, expenseSplits, settlements } from "@/lib/db/payments"
import { trips, users } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"

export type PerUserEntry = {
  user_id: number
  name: string
  avatar_url?: string | null
  amount: number // in smallest unit (paisa/cents). positive => they owe you, negative => you owe them
}

export type BalanceResponse = {
  net: number // your net in smallest unit
  currency: string
  per_user: PerUserEntry[]
}

export async function getBalances(tripId: number, userId: number): Promise<BalanceResponse> {
  // fetch trip to read base currency
  const tripRow = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  })
  const baseCurrency = (tripRow?.baseCurrency as string) || "INR"

  // fetch all expenses for this trip
  const allExpenses = await db.query.expenses.findMany({
    where: eq(expenses.tripId, tripId),
  })

  if (allExpenses.length === 0) {
    return { net: 0, currency: baseCurrency, per_user: [] }
  }

  const expenseIds = allExpenses.map((e) => e.id)
  if (expenseIds.length === 0) {
    return { net: 0, currency: baseCurrency, per_user: [] }
  }

  // fetch payers and splits for these expenses
  const payers = await db.query.expensePayers.findMany({
    where: inArray(expensePayers.expenseId, expenseIds),
  })

  const splits = await db.query.expenseSplits.findMany({
    where: inArray(expenseSplits.expenseId, expenseIds),
  })

  // compute balances map (userId -> amount in smallest unit)
  const balancesMap: Record<number, number> = {}

  for (const p of payers) {
    // amount is assumed already stored in smallest unit
    balancesMap[p.userId] = (balancesMap[p.userId] || 0) + Number(p.amount)
  }

  for (const s of splits) {
    balancesMap[s.userId] = (balancesMap[s.userId] || 0) - Number(s.amountOwed)
  }

  const settles = await db.query.settlements.findMany({
    where: eq(settlements.tripId, tripId),
  })

  for (const st of settles) {
    const amt = Number(st.amount) || 0
    // payer gets +amt (they paid down their debt)
    balancesMap[st.fromUserId] = (balancesMap[st.fromUserId] || 0) + amt
    // receiver gets -amt (their credit decreases)
    balancesMap[st.toUserId] = (balancesMap[st.toUserId] || 0) - amt
  }

  const net = balancesMap[userId] || 0

  // Everyone else with non-zero balance (unique)
  const involvedIds = Array.from(
    new Set(
      Object.keys(balancesMap)
        .map(Number)
        .filter((id) => id !== userId && balancesMap[id] !== 0)
    )
  )
  
  if (involvedIds.length === 0) {
    return { net, currency: baseCurrency, per_user: [] }
  }

  // fetch user details
  const usersRows = await db.query.users.findMany({
    where: inArray(users.id, involvedIds),
  })

  // Sign rule for per_user:
  // balancesMap[other] > 0 means they overpaid (group owes them) => relative to you they do NOT owe you,
  // so make it negative for your perspective. Conversely < 0 => they owe group => positive to you.
  const per_user: PerUserEntry[] = usersRows
    .map((u) => {
      const raw = -(balancesMap[u.id] || 0) // flip sign to be "from your perspective"
      const amount = raw === 0 ? 0 : raw // normalize -0
      return {
        user_id: u.id,
        name: u.name,
        avatar_url: (u.avatarUrl as string) || null,
        amount,
      }
    })
    .filter((u) => u.amount !== 0)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))

  return { net, currency: baseCurrency, per_user }
}