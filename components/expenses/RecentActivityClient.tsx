// components/expenses/RecentActivityClient.tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import ExpenseDetailsModal from "@/components/expenses/ExpenseDetailsModal"
import { formatCurrency } from "@/lib/expenses/formatCurrency"

type ItemExpense = {
  kind: "expense"
  id: number
  title: string
  expenseDateISO: string
  amountConverted: number
  myShare?: number // smallest units
  myPaid?: number  // smallest units
}

type ItemSettlement = {
  kind: "settlement"
  id: number
  fromLabel: string
  toLabel: string
  amount: number
  currency: string
  createdAtISO: string | null
}

type Item = ItemExpense | ItemSettlement

export default function RecentActivityClient({
  items,
  currency,
  tripId,
  currentUser,
}: {
  items: Item[]
  currency: string
  tripId: number
  currentUser?: { id: number; name?: string }
}) {
  const [open, setOpen] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null)

  return (
    <>
      <div className="space-y-4">
        {items.map((item) =>
          item.kind === "expense" ? (
            <button
              key={`exp-${item.id}`}
              className="w-full text-left"
              onClick={() => {
                setSelectedExpenseId(item.id)
                setOpen(true)
              }}
            >
              <Card className="p-4 flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-xs text-slate-500">{new Date(item.expenseDateISO).toLocaleDateString()}</p>
                </div>

                <div className="text-right">
                  {/* compute net: paid - share (both in smallest units) */}
                  {(() => {
                    const myShare = item.myShare ?? 0
                    const myPaid = item.myPaid ?? 0
                    const net = myPaid - myShare

                    // Not included at all
                    if (myShare === 0 && myPaid === 0) {
                      return <p className="text-sm text-slate-500">Not included</p>
                    }

                    // Settled (net 0)
                    if (net === 0) {
                      return (
                        <>
                          <p className="text-sm text-slate-500">Settled</p>
                          <p className="text-lg font-semibold text-slate-600">{formatCurrency(0, currency)}</p>
                        </>
                      )
                    }

                    // You paid more than you owed -> you paid net positive
                    if (net > 0) {
                      return (
                        <>
                          <p className="text-sm text-slate-500">You paid</p>
                          <p className="text-lg font-semibold text-green-600">+{formatCurrency(net, currency)}</p>
                        </>
                      )
                    }

                    // net < 0 -> you owe
                    return (
                      <>
                        <p className="text-sm text-slate-500">You owe</p>
                        <p className="text-lg font-semibold text-red-600">-{formatCurrency(Math.abs(net), currency)}</p>
                      </>
                    )
                  })()}
                  {/* Optionally show total under it as smaller helper */}
                  <p className="text-xs text-slate-500 mt-1">Total: {formatCurrency(item.amountConverted, currency)}</p>
                </div>
              </Card>
            </button>
          ) : (
            <Card key={`set-${item.id}`} className="p-4 bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white">
              <p className="text-sm font-medium">
                {item.fromLabel} paid {item.toLabel} {formatCurrency(item.amount, item.currency)}
              </p>
            </Card>
          )
        )}
      </div>

      <ExpenseDetailsModal tripId={tripId} expenseId={selectedExpenseId} open={open} onOpenChange={setOpen} />
    </>
  )
}