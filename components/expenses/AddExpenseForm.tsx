// components/expenses/AddExpenseForm.tsx
"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type Member = { id: number; name: string }

type PayerMode = "equal" | "absolute" | "percentage" | "shares"
type SplitMode = "equal" | "absolute" | "percentage" | "shares"

type Props = {
  tripId: number
  currentUserId: number
  baseCurrency: string
  members: Member[]
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-slate-800">{children}</h3>
}

export default function AddExpenseForm({
  tripId,
  currentUserId,
  baseCurrency,
  members,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // ---------------- state ----------------
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState<string>("")
  const [currency, setCurrency] = useState<string>(baseCurrency)
  const [amountError, setAmountError] = useState<string>("")
  const [submitting, setSubmitting] = useState(false);

  // Payers: default = equal, only creator selected
  const [payerMode, setPayerMode] = useState<PayerMode>("equal")
  const [payersSelected, setPayersSelected] = useState<Record<number, boolean>>(
    () =>
      members.reduce<Record<number, boolean>>((acc, m) => {
        acc[m.id] = m.id === currentUserId
        return acc
      }, {})
  )
  const [payersValue, setPayersValue] = useState<Record<number, string>>({})

  // Splits: default = equal, everyone selected
  const [splitMode, setSplitMode] = useState<SplitMode>("equal")
  const [splitsSelected, setSplitsSelected] = useState<Record<number, boolean>>(
    () => members.reduce((acc, m) => ((acc[m.id] = true), acc), {} as Record<number, boolean>)
  )
  const [splitsValue, setSplitsValue] = useState<Record<number, string>>({})

  // ---------- helpers ----------
  const selectedPayers = useMemo(
    () => members.filter((m) => payersSelected[m.id]),
    [members, payersSelected]
  )
  const selectedSplits = useMemo(
    () => members.filter((m) => splitsSelected[m.id]),
    [members, splitsSelected]
  )

  const payerTotal = useMemo(() => {
    if (payerMode === "absolute" || payerMode === "percentage" || payerMode === "shares") {
      return selectedPayers.reduce((s, m) => s + (parseFloat(payersValue[m.id] || "0") || 0), 0)
    }
    return 0
  }, [payerMode, selectedPayers, payersValue])

  const splitTotal = useMemo(() => {
    if (splitMode === "absolute" || splitMode === "percentage" || splitMode === "shares") {
      return selectedSplits.reduce((s, m) => s + (parseFloat(splitsValue[m.id] || "0") || 0), 0)
    }
    return 0
  }, [splitMode, selectedSplits, splitsValue])

  // Reset values when switching to "equal"
  useEffect(() => {
    if (splitMode === "equal") setSplitsValue({})
  }, [splitMode])
  useEffect(() => {
    if (payerMode === "equal") setPayersValue({})
  }, [payerMode])

  // If switching TO shares, ensure all selected have at least 1
  useEffect(() => {
    if (payerMode === "shares") {
      setPayersValue((prev) => {
        const next = { ...prev }
        for (const m of selectedPayers) {
          if (!next[m.id] || parseInt(next[m.id], 10) < 1) next[m.id] = "1"
        }
        return next
      })
    }
  }, [payerMode, selectedPayers])
  useEffect(() => {
    if (splitMode === "shares") {
      setSplitsValue((prev) => {
        const next = { ...prev }
        for (const m of selectedSplits) {
          if (!next[m.id] || parseInt(next[m.id], 10) < 1) next[m.id] = "1"
        }
        return next
      })
    }
  }, [splitMode, selectedSplits])

  // ---------- UI row renderer ----------
function renderMemberRow(userId: number, name: string, kind: "payer" | "split") {
  const selected = kind === "payer" ? payersSelected[userId] : splitsSelected[userId]
  const setSelected = (checked: boolean) => {
    if (kind === "payer") {
      setPayersSelected((prev) => ({ ...prev, [userId]: checked }))
      if (payerMode === "shares" && checked && !payersValue[userId]) {
        setPayersValue((prev) => ({ ...prev, [userId]: "1" }))
      }
      if (!checked) {
        setPayersValue((prev) => {
          const { [userId]: _, ...rest } = prev
          return rest
        })
      }
    } else {
      setSplitsSelected((prev) => ({ ...prev, [userId]: checked }))
      if (splitMode === "shares" && checked && !splitsValue[userId]) {
        setSplitsValue((prev) => ({ ...prev, [userId]: "1" }))
      }
      if (!checked) {
        setSplitsValue((prev) => {
          const { [userId]: _, ...rest } = prev
          return rest
        })
      }
    }
  }

  const mode = kind === "payer" ? payerMode : splitMode
  const values = kind === "payer" ? payersValue : splitsValue
  const setValues = kind === "payer" ? setPayersValue : setSplitsValue

  const showNumberInput =
    (kind === "payer" && mode !== "equal") || (kind === "split" && mode !== "equal")

  return (
    <div
      key={`${kind}-${userId}`}
      className="flex items-center justify-between py-2 border-b last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id={`${kind}-${userId}`}
          checked={!!selected}
          onCheckedChange={(val) => setSelected(Boolean(val))}
          className="
            data-[state=checked]:bg-[#00e2b7]
            data-[state=checked]:border-[#00e2b7]
            focus-visible:ring-2
            focus-visible:ring-[#00e2b7]/40
          "
        />
        <Label htmlFor={`${kind}-${userId}`}>{name}</Label>
      </div>

      {showNumberInput && selected && (
        <div className="w-40">
          <Input
            type="number"
            step={mode === "percentage" ? "0.01" : "1"}
            min={mode === "shares" ? 1 : undefined}
            placeholder={
              mode === "absolute" ? "Amount" : mode === "percentage" ? "%" : "Shares"
            }
            value={values[userId] || ""}
            onChange={(e) => {
              const val = e.target.value;
              // Let users type freely; validation happens onBlur
              setValues((prev) => ({ ...prev, [userId]: val }));
            }}
            onBlur={() => {
              const raw = values[userId];
          
              if (mode === "shares") {
                // shares: require integer >= 1, else deselect
                const intVal = parseInt(raw || "", 10);
                if (!intVal || intVal < 1) {
                  setSelected(false);
                } else {
                  setValues((prev) => ({ ...prev, [userId]: String(Math.max(1, Math.floor(intVal))) }));
                }
                return;
              }
          
              if (mode === "percentage") {
                // percentage: require > 0, clamp to [0.01, 100], max 2 decimals
                let n = parseFloat(raw || "");
                if (!Number.isFinite(n) || n <= 0) {
                  setSelected(false);
                } else {
                  n = Math.min(100, Math.max(0.01, n));
                  const fixed = Math.floor(n * 100) / 100; // max 2 decimals
                  setValues((prev) => ({ ...prev, [userId]: fixed.toString() }));
                }
                return;
              }
          
              if (mode === "absolute") {
                // absolute: require > 0; normalize to 2 decimals
                let n = parseFloat(raw || "");
                if (!Number.isFinite(n) || n <= 0) {
                  setSelected(false);
                } else {
                  const fixed = Math.round(n * 100) / 100;
                  setValues((prev) => ({ ...prev, [userId]: fixed.toFixed(2) }));
                }
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

  // ---------- submit ----------
  async function handleSubmit() {
    if (submitting) return; // prevent double submit
    setSubmitting(true);
    const amt = parseFloat(amount || "0")
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" })
      return
    }
    if (!(amt > 0)) {
      toast({ title: "Amount must be > 0", variant: "destructive" })
      return
    }

    // Build payers payload
    const payers = members
      .filter((m) => payersSelected[m.id])
      .map((m) => {
        const raw = parseFloat(payersValue[m.id] || "0")
        return {
          userId: m.id,
          mode: payerMode,
          value:
            payerMode === "equal"
              ? undefined
              : payerMode === "shares"
              ? Math.max(1, Math.floor(Number.isFinite(raw) ? raw : 1))
              : Number.isFinite(raw) ? raw : 0,
        }
      })

    if (payers.length === 0) {
      toast({ title: "Select at least one payer", variant: "destructive" })
      return
    }

    // Build splits payload
    let splits: Array<{ userId: number; mode: SplitMode; value?: number }> = []
    if (splitMode === "equal") {
      splits = members.filter((m) => splitsSelected[m.id]).map((m) => ({ userId: m.id, mode: "equal" }))
    } else {
      splits = members
        .filter((m) => splitsSelected[m.id])
        .map((m) => {
          const raw = parseFloat(splitsValue[m.id] || "0")
          return {
            userId: m.id,
            mode: splitMode,
            value:
              splitMode === "shares"
                ? Math.max(1, Math.floor(Number.isFinite(raw) ? raw : 1))
                : Number.isFinite(raw) ? raw : 0,
          }
        })
    }

    const body = {
      title,
      description: description || undefined,
      amount: amt,
      currency,
      expenseDate: new Date().toISOString(),
      payers,
      splits,
    }

    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to create expense")
      }
      toast({ title: "Expense added ✅" })
      router.push(`/dashboard/trips/${tripId}/expenses`)
      router.refresh()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }finally {
      setSubmitting(false);
    }
  }

  // tiny epsilon to compare floats
  const EPS = 1e-9;
  
  function getHelperClass(kind: "payer" | "split") {
    const mode = kind === "payer" ? payerMode : splitMode;
    const total = kind === "payer" ? payerTotal : splitTotal;
  
    if (mode === "percentage") {
      if (total < 100 - EPS) return "text-yellow-600";
      if (Math.abs(total - 100) < EPS) return "text-green-600";
      return "text-red-600";
    }
    if (mode === "absolute") {
      const amtNum = parseFloat(amount || "0");
      if (!(amtNum > 0)) return "text-slate-500"; // no baseline yet
      if (total < amtNum - EPS) return "text-yellow-600";
      if (Math.abs(total - amtNum) < EPS) return "text-green-600";
      return "text-red-600";
    }
    if (mode === "shares") {
      return "text-green-600"; // always green for shares
    }
    return "text-slate-500";
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl">Add Expense</CardTitle>
        <CardDescription>Fill in the details and save</CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Basics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dinner" />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-3">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={baseCurrency}>{baseCurrency}</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (amountError) setAmountError("");
                }}
                onBlur={() => {
                  const n = parseFloat(amount || "");
                  if (!Number.isFinite(n) || n <= 0) {
                    setAmount("");
                    setAmountError("*The total amount must be greater than 0");
                  } else {
                    setAmountError("");
                  }
                }}
                placeholder="0.00"
              />
            </div>
            {amountError && (
              <p className="mt-1 text-xs text-red-600">{amountError}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="desc">Description (optional)</Label>
            <Textarea
              id="desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short note"
            />
          </div>
        </div>

        {/* Payers & Splits side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payers */}
          <div className="space-y-3">
            <SectionTitle>Payers (who paid)</SectionTitle>

            <div className="flex gap-3 items-center">
              <Label className="text-sm">Mode</Label>
              <Select value={payerMode} onValueChange={(v) => setPayerMode(v as PayerMode)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal</SelectItem>
                  <SelectItem value="absolute">Absolute</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="shares">Shares</SelectItem>
                </SelectContent>
              </Select>

            </div>
            <div className="rounded-lg border p-3">
              {members.map((m) => renderMemberRow(m.id, m.name, "payer"))}
                <div className={`mt-2 text-xs ${getHelperClass("payer")}`}>
                    {payerMode === "equal" && <>Even split between selected</>}
                    {payerMode === "absolute" && (
                    <>
                        <span className="font-medium">Current total:</span>{" "}
                        {payerTotal.toFixed(2)} {currency}
                    </>
                    )}
                    {payerMode === "percentage" && (
                    <>
                        <span className="font-medium">Current total:</span>{" "}
                        {payerTotal.toFixed(2)}%
                    </>
                    )}
                    {payerMode === "shares" && (
                    <>
                        <span className="font-medium">Current shares:</span>{" "}
                        {payerTotal}
                    </>
                    )}
                </div>
            </div>
          </div>

          {/* Splits */}
          <div className="space-y-3">
            <SectionTitle>Split Between (who owes)</SectionTitle>

            <div className="flex gap-3 items-center">
              <Label className="text-sm">Mode</Label>
              <Select value={splitMode} onValueChange={(v) => setSplitMode(v as SplitMode)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal</SelectItem>
                  <SelectItem value="absolute">Absolute</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="shares">Shares</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-3">
              {members.map((m) => renderMemberRow(m.id, m.name, "split"))}
              
                <div className={`mt-2 text-xs ${getHelperClass("split")}`}>
                    {splitMode === "equal" && <>Even split between selected</>}
                    {splitMode === "absolute" && (
                    <>
                        <span className="font-medium">Current total:</span>{" "}
                        {splitTotal.toFixed(2)} {currency}
                    </>
                    )}
                    {splitMode === "percentage" && (
                    <>
                        <span className="font-medium">Current total:</span>{" "}
                        {splitTotal.toFixed(2)}%
                    </>
                    )}
                    {splitMode === "shares" && (
                    <>
                        <span className="font-medium">Current shares:</span>{" "}
                        {splitTotal}
                    </>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="pt-2 flex">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full max-w-md mx-auto bg-gradient-to-r from-[#00e2b7] to-teal-600 hover:opacity-95 ${
              submitting ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {submitting ? "Saving…" : "Save Expense"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}