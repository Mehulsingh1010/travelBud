// lib/expenses/minimalSettlements.ts
export type Transfer = { fromUserId: number; toUserId: number; amount: number }

/**
 * Greedy deterministic algorithm:
 * - creditors: users with positive balance (group owes them)
 * - debtors: users with negative balance (they owe group)
 * Match largest creditor with largest debtor until all settled.
 *
 * Balances map: userId -> netBalance (smallest units). Positive = creditor.
 */
export function computeMinimalTransfers(balancesMap: Record<number, number>): Transfer[] {
  const creditors: { userId: number; bal: number }[] = []
  const debtors: { userId: number; bal: number }[] = []

  for (const k of Object.keys(balancesMap)) {
    const id = Number(k)
    const bal = balancesMap[id] || 0
    if (bal > 0) creditors.push({ userId: id, bal })
    else if (bal < 0) debtors.push({ userId: id, bal: -bal }) // store positive owed amount
  }

  // sort descending by amount, tie-break by userId for determinism
  creditors.sort((a, b) => b.bal - a.bal || a.userId - b.userId)
  debtors.sort((a, b) => b.bal - a.bal || a.userId - b.userId)

  const transfers: Transfer[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.bal, creditor.bal)

    transfers.push({
      fromUserId: debtor.userId,
      toUserId: creditor.userId,
      amount,
    })

    debtor.bal -= amount
    creditor.bal -= amount

    if (debtor.bal === 0) i++
    if (creditor.bal === 0) j++
  }

  return transfers
}