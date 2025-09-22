// components/expenses/RecentActivityClient.tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import ExpenseDetailsModal from "@/components/expenses/ExpenseDetailsModal"
import { formatCurrency } from "@/lib/expenses/formatCurrency"
import { useRouter } from "next/navigation"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  fromUserId: number
  toUserId: number
}

type Item = ItemExpense | ItemSettlement

export default function RecentActivityClient({
  items,
  currency,
  tripId,
  currentUser,
  userRole,
}: {
  items: Item[]
  currency: string
  tripId: number
  currentUser?: { id: number; name?: string }
  userRole?: string
}) {
  const [open, setOpen] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null)
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function DeleteSettlement(id:number){
    if(!confirm("Deleting this settlement cannot be undone. Are you sure?")) return;
    setDeletingId(id)
    try{
      const res = await fetch(`/api/trips/${tripId}/settlements/${id}`, {
        method: "DELETE",
        credentials:"same-origin",
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload?.error || "Failed to delete settlement")
        router.refresh()
    } catch(err:any){
      alert(err?.message || "Error deleting settlement")
    } finally{
      setDeletingId(null)
    }
  }

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
                  {/* Show total under it as smaller helper */}
                  <p className="text-xs text-slate-500 mt-1">Total: {formatCurrency(item.amountConverted, currency)}</p>
                </div>
              </Card>
            </button>
          ) : (
            // Settlement card — show delete button if allowed
            <Card key={`set-${item.id}`} className="p-4 bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {item.fromLabel} paid {item.toLabel} {formatCurrency((item as ItemSettlement).amount, (item as ItemSettlement).currency)}
                </p>
                <p className="text-xs text-slate-500">{(item as ItemSettlement).createdAtISO ? new Date((item as ItemSettlement).createdAtISO!).toLocaleString() : ""}</p>
              </div>

              {/* Delete button visible to payer, receiver, or trip admin/creator */}
              {(() => {
                const isPayer = currentUser?.id === (item as ItemSettlement).fromUserId
                const isReceiver = currentUser?.id === (item as ItemSettlement).toUserId
                const isAdmin = userRole === "admin" || userRole === "creator"
                if (isPayer || isReceiver || isAdmin) {
                  return (
                    <div className="ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/40 text-white text-sm font-medium rounded-full
                                   transition-transform duration-150 ease-in-out hover:scale-105 hover:bg-red-600/90 disabled:opacity-50"
                        onClick={() => DeleteSettlement(item.id)}
                        disabled={deletingId === item.id}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {deletingId === item.id ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                  )
                }
                return null
              })()}
            </Card>
          )
        )}
      </div>

      <ExpenseDetailsModal
        tripId={tripId}
        expenseId={selectedExpenseId}
        open={open}
        onOpenChange={setOpen}
        currentUser={currentUser}
        userRole={userRole}
      />
    </>
  )
}