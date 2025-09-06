// components/expenses/ExpenseSummaryCard.tsx (client, no async)
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/expenses/formatCurrency";
import Image from "next/image";
import { BalanceResponse, PerUserEntry } from "@/lib/expenses/getBalance";

interface Props {
  tripId: number;
  balances: BalanceResponse;
}

export default function ExpenseSummaryCard({ tripId, balances }: Props) {
  const net = balances.net;
  const currency = balances.currency;

  const topCounterparties: PerUserEntry[] = balances.per_user
    .slice()
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 3);

  const netDisplay =
    net === 0
      ? "You are Settled!!"
      : `${net > 0 ? "+" : "-"}${formatCurrency(Math.abs(net), currency)}`;

  const netClass = net > 0 ? "text-green-600" : net < 0 ? "text-red-600" : "text-slate-500";

  return (
    <Card className="shadow-md border rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Expense Manager</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Net balance */}
        <div className={`text-2xl font-bold mb-4 ${netClass}`}>{netDisplay}</div>

        {/* List of counterparties */}
        <div className="space-y-2 mb-4">
          {topCounterparties.length > 0 ? (
            topCounterparties.map((cp: PerUserEntry) => (
              <div key={cp.user_id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {cp.avatar_url ? (
                    <Image
                      src={cp.avatar_url}
                      alt={cp.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-xs">
                      {cp.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{cp.name}</span>
                </div>
                <span className={cp.amount > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {cp.amount > 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(cp.amount), currency)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No outstanding balances</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <Link href={`/dashboard/trips/${tripId}/expenses`}>
            <Button variant="outline" className="transition-transform hover:scale-105">
              Go to Expenses
            </Button>
          </Link>
          {balances.per_user.length > 3 && (
            <Link href={`/dashboard/trips/${tripId}/expenses`} className="text-xs text-blue-600 hover:underline">
              View More
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}