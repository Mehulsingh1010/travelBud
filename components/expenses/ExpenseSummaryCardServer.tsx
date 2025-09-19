// components/expenses/ExpenseSummaryCardServer.tsx
import { getBalances } from "@/lib/expenses/getBalance";
import ExpenseSummaryCard from "./ExpenseSummaryCard";

interface Props {
  tripId: number;
  currentUserId: number;
}

export default async function ExpenseSummaryCardServer({ tripId, currentUserId }: Props) {
  const balances = await getBalances(tripId, currentUserId);
  return <ExpenseSummaryCard balances={balances} tripId={tripId} />;
}