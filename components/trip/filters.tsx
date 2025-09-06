"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type LocalFilters = {
  location?: string
  days?: number
  people?: number
  status?: "open" | "closed" | ""
  feeMin?: number
  feeMax?: number
  dateFrom?: string
  dateTo?: string
  eighteenPlus?: boolean
}

export function SearchFilters({
  keyword,
  onKeywordChange,
  onSearch,
  className,
}: {
  keyword: string
  onKeywordChange: (v: string) => void
  onSearch: (f: { keyword: string } & LocalFilters) => void
  className?: string
}) {
  const [f, setF] = useState<LocalFilters>({ status: "", eighteenPlus: false })
  const set = (k: keyof LocalFilters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({
      ...prev,
      [k]: e.currentTarget.type === "number" ? Number(e.currentTarget.value) : e.currentTarget.value,
    }))

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-4 md:p-5", className)}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="kw" className="text-slate-700">
            Keyword
          </Label>
          <Input
            id="kw"
            placeholder="beach, hiking..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.currentTarget.value)}
          />
        </div>

        <div>
          <Label htmlFor="loc" className="text-slate-700">
            Location
          </Label>
          <Input id="loc" placeholder="Greece, Tokyo..." onChange={set("location")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="days" className="text-slate-700">
              Days
            </Label>
            <Input id="days" type="number" min={1} placeholder="7" onChange={set("days")} />
          </div>
          <div>
            <Label htmlFor="people" className="text-slate-700">
              People
            </Label>
            <Input id="people" type="number" min={1} placeholder="4" onChange={set("people")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min" className="text-slate-700">
              Fee min
            </Label>
            <Input id="min" type="number" min={0} placeholder="0" onChange={set("feeMin")} />
          </div>
          <div>
            <Label htmlFor="max" className="text-slate-700">
              Fee max
            </Label>
            <Input id="max" type="number" min={0} placeholder="5000" onChange={set("feeMax")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from" className="text-slate-700">
              From
            </Label>
            <Input id="from" type="date" onChange={set("dateFrom")} />
          </div>
          <div>
            <Label htmlFor="to" className="text-slate-700">
              To
            </Label>
            <Input id="to" type="date" onChange={set("dateTo")} />
          </div>
        </div>

        <div>
          <Label htmlFor="status" className="text-slate-700">
            Status
          </Label>
          <select
            id="status"
            className="mt-2 block w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
            onChange={set("status")}
          >
            <option value="">Any</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="adult" onCheckedChange={(checked) => setF((prev) => ({ ...prev, eighteenPlus: checked }))} />
          <Label htmlFor="adult" className="text-slate-700">
            18+ only
          </Label>
        </div>

        <div className="md:col-span-4 flex justify-end">
          <Button onClick={() => onSearch({ keyword, ...f })}>Search</Button>
        </div>
      </div>
    </div>
  )
}

export default SearchFilters
