"use client";

import { useCurrency } from "@/context/CurrencyContext";
import SummaryCard from "./SummaryCard";
import type { Expense, MonthlyBudget } from "@/types/expense";

interface DashboardSummaryProps {
    expenses: Expense[];
    budget: MonthlyBudget;
    month: string;
}

export default function DashboardSummary({
    expenses,
    budget,
    month,
}: DashboardSummaryProps) {
    const { formatAmount } = useCurrency();

    const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = budget.amount;
    const remaining = totalBudget - totalSpent;

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const daysInMonth =
        month === currentMonth
            ? today.getDate()
            : new Date(parseInt(month.slice(0, 4)), parseInt(month.slice(5, 7)), 0).getDate();
    const avgPerDay = daysInMonth > 0 ? Math.round(totalSpent / daysInMonth) : 0;

    const remainingTrend: "up" | "down" | "neutral" =
        remaining < 0 ? "up" : remaining > 0 ? "down" : "neutral";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
                label="Total Spent"
                value={formatAmount(totalSpent)}
                subLabel={`${monthExpenses.length} transaction${monthExpenses.length !== 1 ? "s" : ""}`}
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
                label="Avg per Day"
                value={formatAmount(avgPerDay)}
                subLabel={`Over ${daysInMonth} day${daysInMonth !== 1 ? "s" : ""}`}
                gradient="linear-gradient(135deg, #a855f7, #c084fc)"
            />
        </div>
    );
}
