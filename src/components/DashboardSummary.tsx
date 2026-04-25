"use client";

import { useCurrency } from "@/context/CurrencyContext";
import SummaryCard from "./SummaryCard";
import { useExpenseSummary } from "../hooks/useExpenseSummary";
import { useAppSelector } from "@/hooks/useRedux";
import type { ExpenseCategory } from "@/types/expense";

interface DashboardSummaryProps {
  month: string;
}

const ALL_CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "housing",
  "health",
  "entertainment",
  "education",
  "shopping",
  "other",
];

export default function DashboardSummary({ month }: DashboardSummaryProps) {
  const { formatAmount } = useCurrency();
  const { totalSpent, totalBudget, remaining, byCategory } =
    useExpenseSummary(month);
  const transactionCount = useAppSelector(
    (state) => state.expenses.expenses.filter((e) => e.date.startsWith(month)).length,
  );
  const remainingTrend: "up" | "down" | "neutral" =
    remaining < 0 ? "up" : remaining > 0 ? "down" : "neutral";

  const categoriesWithSpend = ALL_CATEGORIES.filter((cat) => byCategory[cat] > 0).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Total Spent"
        value={formatAmount(totalSpent)}
        subLabel={`${categoriesWithSpend} active categor${categoriesWithSpend === 1 ? "y" : "ies"}`}
        trend="up"
        gradient="linear-gradient(135deg, #ef4444, #f87171)"
      />
      <SummaryCard
        label="Monthly Budget"
        value={formatAmount(totalBudget)}
        subLabel={totalBudget === 0 ? "No budget set" : undefined}
        gradient="linear-gradient(135deg, #3b82f6, #60a5fa)"
      />
      <SummaryCard
        label="Remaining"
        value={formatAmount(Math.abs(remaining))}
        subLabel={remaining < 0 ? "Over budget!" : undefined}
        trend={remainingTrend}
        gradient="linear-gradient(135deg, #10b981, #34d399)"
      />
      <SummaryCard
        label="Total Transactions"
        value={String(transactionCount)}
        subLabel={`${month} summary`}
        gradient="linear-gradient(135deg, #a855f7, #c084fc)"
      />
    </div>
  );
}
