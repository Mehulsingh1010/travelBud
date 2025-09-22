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
type GradientArrowProps = {
  height?: number;           // px height of the shaft
  headRatio?: number;        // fraction of total width used by arrow head (0..1)
  startColor?: string;
  endColor?: string;
  className?: string;        // tailwind classes for sizing (e.g. "w-full")
  ariaLabel?: string;
};

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

export function GradientArrow({
  height = 14,
  headRatio = 0.18,
  startColor = "#ef4444",
  endColor = "#10b981",
  className,
  ariaLabel = "payment arrow",
}: GradientArrowProps) {
  const id = React.useId();
  // viewBox coordinates — we'll use user-space gradient mapping
  const viewW = 100;
  const viewH = 24;
  const headW = viewW * headRatio;
  const shaftW = viewW - headW;
  const shaftRadius = Math.max(2, height / 2);

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: "100%", height: `${height}px`, display: "block" }}
    >
      <defs>
        {/* IMPORTANT: gradientUnits="userSpaceOnUse" makes the gradient coordinates use the same
            user space as the shapes (so it's continuous across rect + polygon). */}
        <linearGradient id={`g-${id}`} gradientUnits="userSpaceOnUse" x1="0" x2={String(viewW)} y1="0" y2="0">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>

      {/* Shaft */}
      <rect
        x="0"
        y={(viewH - height) / 2}
        rx={shaftRadius}
        ry={shaftRadius}
        width={shaftW}
        height={height}
        fill={`url(#g-${id})`}
        stroke="none"
      />

      {/* Slight overlap polygon so there's no 1px seam: start the polygon a hair earlier (shaftW - 0.5) */}
      <polygon
        points={`${shaftW - 0.5},${(viewH - height) / 2} ${viewW},${viewH / 2} ${shaftW - 0.5},${(viewH + height) / 2}`}
        fill={`url(#g-${id})`}
        stroke="none"
      />

      {/* Subtle highlight overlay on shaft (not on head) */}
      <rect
        x="0"
        y={(viewH - height) / 2}
        rx={shaftRadius}
        ry={shaftRadius}
        width={shaftW}
        height={Math.max(1, height * 0.22)}
        fill="rgba(255,255,255,0.12)"
        pointerEvents="none"
      />
    </svg>
  );
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

        {/* Names + gradient arrow between (simplified layout) */}
        <div className="mt-4">
          <div className="flex items-center gap-3">
            {/* Left: payer */}
            <div className="flex flex-col items-start">
              <span className="font-semibold text-sm whitespace-nowrap">
                {currentUser.name}
              </span>
              <span className="text-xs text-slate-500">you</span>
            </div>

            {/* Arrow takes remaining space */}
            <div className="flex-1">
              <GradientArrow
                className="w-full"
                height={16}
                headRatio={0.18}
                startColor="#ef4444"
                endColor="#10b981"
                ariaLabel={`Arrow from ${currentUser.name} to ${counterparty.name}`}
              />
            </div>

            {/* Right: receiver; whitespace-nowrap keeps it aligned right when space is tight */}
            <div className="flex flex-col items-start">
              <span className="font-semibold text-sm whitespace-nowrap text-right">{counterparty.name}</span>
              <span className="text-xs text-slate-500 whitespace-nowrap text-right">Creditor</span>
            </div>
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