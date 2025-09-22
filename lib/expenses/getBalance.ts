// lib/expenses/getBalances.ts
import { db } from "@/lib/db"
import { expenses, expensePayers, expenseSplits, settlements } from "@/lib/db/payments"
import { trips, users } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"

export type PerUserEntry = {
  user_id: number
  name: string
  avatar_url?: string | null
  amount: number // smallest unit (positive => they owe you, negative => you owe them)
}

export type Recommendation = {
  fromUserId: number
  toUserId: number
  amount: number // smallest units
}

export type BalanceResponse = {
  net: number
  currency: string
  per_user: PerUserEntry[]
  recommendations?: Recommendation[]
}

/**
 * Greedy minimal transfers:
 * - Input: balancesMap userId -> balance (smallest units), where positive = group owes user (creditor),
 *   negative = user owes group (debtor).
 * - Output: array of { fromUserId, toUserId, amount } (all positive amounts, smallest units).
 *
 * This is deterministic and O(n log n) using two sorted lists.
 */
function computeMinimalTransfers(balancesMap: Record<number, number>): Recommendation[] {
  // Build arrays of debtors (negative) and creditors (positive)
  const debtors: Array<{ userId: number; amt: number }> = []
  const creditors: Array<{ userId: number; amt: number }> = []

  for (const [k, v] of Object.entries(balancesMap)) {
    const userId = Number(k)
    const bal = Math.round(Number(v) || 0)
    if (bal === 0) continue
    if (bal < 0) debtors.push({ userId, amt: -bal }) // they owe amount
    else creditors.push({ userId, amt: bal }) // they should receive amount
  }

  // sort descending so we pop largest first (deterministic)
  debtors.sort((a, b) => b.amt - a.amt)
  creditors.sort((a, b) => b.amt - a.amt)

  const out: Recommendation[] = []
  let di = 0
  let ci = 0

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di]
    const creditor = creditors[ci]
    const transfer = Math.min(debtor.amt, creditor.amt)

    if (transfer > 0) {
      out.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: transfer,
      })
    }

    debtor.amt -= transfer
    creditor.amt -= transfer

    if (debtor.amt === 0) di++
    if (creditor.amt === 0) ci++
  }

  return out
}

export async function getBalances(tripId: number, userId: number): Promise<BalanceResponse> {
  // --- your existing logic (fetch trip, expenses, payers, splits, settlements) ---
  const tripRow = await db.query.trips.findFirst({ where: eq(trips.id, tripId) })
  const baseCurrency = (tripRow?.baseCurrency as string) || "INR"

  const allExpenses = await db.query.expenses.findMany({ where: eq(expenses.tripId, tripId) })
  if (allExpenses.length === 0) return { net: 0, currency: baseCurrency, per_user: [] }
  const expenseIds = allExpenses.map((e) => e.id)
  if (expenseIds.length === 0) return { net: 0, currency: baseCurrency, per_user: [] }

  const payers = await db.query.expensePayers.findMany({ where: inArray(expensePayers.expenseId, expenseIds) })
  const splits = await db.query.expenseSplits.findMany({ where: inArray(expenseSplits.expenseId, expenseIds) })

  const balancesMap: Record<number, number> = {}

  for (const p of payers) {
    balancesMap[p.userId] = (balancesMap[p.userId] || 0) + Number(p.amount)
  }
  for (const s of splits) {
    balancesMap[s.userId] = (balancesMap[s.userId] || 0) - Number(s.amountOwed)
  }

  // include settlements (already in smallest units)
  const settles = await db.query.settlements.findMany({ where: eq(settlements.tripId, tripId) })
  for (const st of settles) {
    const amt = Number(st.amount) || 0
    balancesMap[st.fromUserId] = (balancesMap[st.fromUserId] || 0) + amt
    balancesMap[st.toUserId] = (balancesMap[st.toUserId] || 0) - amt
  }

  const net = balancesMap[userId] || 0

  // per_user unchanged (flip sign to be "from your perspective")
  const involvedIds = Array.from(
    new Set(Object.keys(balancesMap).map(Number).filter((id) => id !== userId && balancesMap[id] !== 0))
  )
  if (involvedIds.length === 0) {
    return { net, currency: baseCurrency, per_user: [] }
  }

  const usersRows = await db.query.users.findMany({ where: inArray(users.id, involvedIds) })
  const per_user: PerUserEntry[] = usersRows
    .map((u) => {
      const raw = -(balancesMap[u.id] || 0)
      const amount = raw === 0 ? 0 : raw
      return { user_id: u.id, name: u.name, avatar_url: (u.avatarUrl as string) || null, amount }
    })
    .filter((u) => u.amount !== 0)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))

  // compute minimal transfers (recommendations)
  // Important: computeMinimalTransfers expects balancesMap with convention:
  // positive => group owes user (creditor), negative => user owes group (debtor).
  const recommendations = computeMinimalTransfers(balancesMap)

  return { net, currency: baseCurrency, per_user, recommendations }
}