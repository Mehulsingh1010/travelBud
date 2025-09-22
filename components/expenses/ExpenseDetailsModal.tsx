// components/expenses/ExpenseDetailsModal.tsx
"use client"

import useSWR from "swr"
import { useState } from "react"
import {useRouter} from "next/navigation"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/expenses/formatCurrency"
import Image from "next/image"
import ExpenseComments from "./ExpenseComments"
/**
 * Render an avatar: if avatarUrl present -> <Image> inside <Avatar>,
 * otherwise AvatarFallback with initial.
 *
 * sizePx: width/height in px for image and container (use same as your Avatar sizes)
 */
function renderAvatar(avatarUrl: string | null | undefined, name: string | null | undefined, sizePx = 36) {
  const initial = (name && name.length > 0 ? name.charAt(0).toUpperCase() : "U")
  if (avatarUrl) {
    // next/image requires absolute URL to be allowed in next.config.js for external hosts.
    return (
      <Avatar style={{ width: sizePx, height: sizePx }}>
        <div className="relative overflow-hidden rounded-full" style={{ width: sizePx, height: sizePx }}>
          <Image
            src={avatarUrl}
            alt={name ?? "Avatar"}
            fill
            sizes={`${sizePx}px`}
            style={{ objectFit: "cover" }}
          />
        </div>
      </Avatar>
    )
  }
  return (
    <Avatar style={{ width: sizePx, height: sizePx }}>
      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
        {initial}
      </AvatarFallback>
    </Avatar>
  )
}

type BreakdownUser = {
  userId: number
  name: string | null
  avatarUrl: string | null
}

type PayerRow = BreakdownUser & {
  amount: number
  mode: "absolute" | "percentage" | "shares" | "equal"
  shareValue: number | null
}

type SplitRow = BreakdownUser & {
  amountOwed: number
  mode: "absolute" | "percentage" | "shares" | "equal"
  shareValue: number | null
}

type ExpenseDetailsResponse = {
  expense: {
    id: number
    tripId: number
    title: string
    description: string | null
    amountOriginal: number
    currencyOriginal: string
    amountConverted: number
    baseCurrency: string
    expenseDate: string
    createdBy: number | null
    createdAt: string | null
    updatedAt: string | null
  }
  payers: PayerRow[]
  splits: SplitRow[]
}

// replace the previous fetcher with this
const fetcher = async (url: string) => {
  const res = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: { "Accept": "application/json" },
  })

  // Try to parse JSON body (if any) to provide a helpful message
  const contentType = res.headers.get("content-type") || ""
  const textBody = await res.text()
  let jsonBody: any = null
  if (contentType.includes("application/json")) {
    try {
      jsonBody = JSON.parse(textBody)
    } catch (e) {
      jsonBody = { raw: textBody }
    }
  }

  if (!res.ok) {
    const msg =
      jsonBody?.error ||
      jsonBody?.message ||
      (typeof jsonBody === "string" ? jsonBody : null) ||
      textBody ||
      res.statusText ||
      `HTTP ${res.status}`
    throw new Error(String(msg))
  }

  // finally return parsed JSON (if any)
  try {
    return jsonBody ?? JSON.parse(textBody)
  } catch {
    return textBody
  }
}

export default function ExpenseDetailsModal({
  tripId,
  expenseId,
  open,
  onOpenChange,
  currentUser,
  userRole
}: {
  tripId: number
  expenseId: number | null
  open: boolean
  onOpenChange: (v: boolean) => void
  currentUser?: { id: number; name?: string }
  userRole?: string
}) {
  const { data, isLoading, error } = useSWR<ExpenseDetailsResponse>(
    open && expenseId ? `/api/trips/${tripId}/expenses/${expenseId}` : null,
    fetcher
  )

  const expense = data?.expense
  const payers = data?.payers ?? []
  const splits = data?.splits ?? []

  const baseCurrency = expense?.baseCurrency ?? "INR"

  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  async function onDeleteExpense() {
    if (!expense) return;
    if (!confirm("Delete this expense? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses/${expense.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Failed to delete");

      // success: close modal and refresh
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Failed to delete expense");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
        </DialogHeader>

        {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">Failed to load: {String(error.message || error)}</p>}

        {expense && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">{expense.title}</h3>
              {expense.description && (
                <p className="text-sm text-slate-600 mt-1">{expense.description}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Date: {new Date(expense.expenseDate).toLocaleString()}
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Total (base)</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(expense.amountConverted, baseCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Original</p>
                    <p className="text-sm">
                      {formatCurrency(expense.amountOriginal, expense.currencyOriginal)}{" "}
                      <span className="text-slate-500">({expense.currencyOriginal})</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payers */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Who paid</h4>
                <div className="space-y-2">
                  {payers.length === 0 && (
                    <p className="text-xs text-slate-500">No payer rows</p>
                  )}
                  {payers.map((p) => (
                    <div key={`payer-${p.userId}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderAvatar(p.avatarUrl ?? null, p.name ?? null, 24)}
                        <span className="text-sm">{p.name ?? `User ${p.userId}`}</span>
                        <span className="text-xs text-slate-500">
                          {p.mode}{p.shareValue != null ? ` (${p.shareValue})` : ""}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(p.amount, baseCurrency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Splits */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Split among</h4>
                <div className="space-y-2">
                  {splits.length === 0 && (
                    <p className="text-xs text-slate-500">No split rows</p>
                  )}
                  {splits.map((s) => (
                    <div key={`split-${s.userId}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Render avatar — small size */}
                        {renderAvatar(s.avatarUrl ?? null, s.name ?? null, 24)}
                        <span className="text-sm">{s.name ?? `User ${s.userId}`}</span>
                        <span className="text-xs text-slate-500">
                          {s.mode}{s.shareValue != null ? ` (${s.shareValue})` : ""}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(s.amountOwed, baseCurrency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* conditional Delete button — show only for allowed users */}
            {expense && (currentUser?.id === expense.createdBy || userRole === "creator" || userRole === "admin") && (
              <div className="flex justify-start mt-4">
                <button
                  onClick={onDeleteExpense}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md 
                             transition-transform duration-150 ease-in-out hover:scale-105 hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            )}
            {/* Comments */}
            <div className="space-y-2">
              {expense?.id ? (
                <ExpenseComments tripId={tripId} expenseId={expense.id} currentUser={currentUser} />
              ) : (
                <p className="text-xs text-slate-500">Comments will appear here</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}