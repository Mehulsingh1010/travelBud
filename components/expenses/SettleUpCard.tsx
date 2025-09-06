//components/expenses/SettleUpCard.tsx
"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/expenses/formatCurrency"
import { ArrowRight } from "lucide-react"

type Counterparty = {
  id: number
  name: string
  // positive smallest units you owe THEM
  amountOwed: number
  currency: string
}

type Props = {
  tripId: number
  currentUser: { id: number; name: string }
  counterparty: Counterparty
  trigger?: React.ReactNode
}

export default function SettleUpCard({ tripId, currentUser, counterparty, trigger }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const maxMajor = useMemo(() => counterparty.amountOwed / 100, [counterparty.amountOwed])
  const [input, setInput] = useState<string>(() => (maxMajor > 0 ? maxMajor.toFixed(2) : ""))
  const [error, setError] = useState<string>("")

  const validNumber = useMemo(() => {
    const n = parseFloat(input || "0")
    return Number.isFinite(n) ? n : 0
  }, [input])

  const withinRange = validNumber > 0 && validNumber <= maxMajor

  function onBlurValidate() {
    const amt = parseFloat(input || "0")
    if (!(amt > 0)) {
      setError("*The amount must be greater than 0")
      return
    }
    if (amt > maxMajor) {
      setError(`*Cannot exceed ${formatCurrency(counterparty.amountOwed, counterparty.currency)}`)
      return
    }
    setError("")
  }

  async function submitSettlement() {
    try {
      const amt = parseFloat(input || "0")
      if (!(amt > 0) || amt > maxMajor) {
        onBlurValidate()
        return
      }
      const payload = {
        toUserId: counterparty.id,
        amount: Math.round(amt * 100),
        currency: counterparty.currency,
      }
      const res = await fetch(`/api/trips/${tripId}/settlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to settle")
      }
      toast({ title: "Settlement recorded ✅" })
      setOpen(false)
      router.refresh() // <— refresh here (no function prop needed)
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Something went wrong", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settle Up!!</DialogTitle>
        </DialogHeader>

        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00e2b7] to-transparent rounded-full" />

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span className="font-semibold">{currentUser.name}</span>
            <span className="font-semibold">{counterparty.name}</span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-green-500 opacity-90" />
            <ArrowRight className="absolute -right-1 -top-2 h-6 w-6 text-white drop-shadow" />
          </div>
        </div>

        <div className="mt-6 flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-600 block mb-1">
              Amount to settle (max {formatCurrency(counterparty.amountOwed, counterparty.currency)})
            </label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={onBlurValidate}
              placeholder="0.00"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <Button
            onClick={submitSettlement}
            disabled={!withinRange}
            className="bg-gradient-to-r from-[#00e2b7] to-teal-600 text-white"
          >
            Settle!
          </Button>
        </div>

        <div className="mt-4">
          <Button variant="outline" className="w-full" disabled>
            Pay now (coming soon)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}