import { useMemo } from "react";
import { useAppSelector } from "./useRedux";
import type { ExpenseCategory, ExpenseSummary } from "@/types/expense";

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

/**
 * Computes spending summary for a given month.
 *
 * @param month - e.g. "2025-01"
 * @returns fully typed ExpenseSummary
 */
export function useExpenseSummary(month: string): ExpenseSummary {
    const expenses = useAppSelector((state) => state.expenses.expenses);
    const budgets = useAppSelector((state) => state.budget.budgets);

    return useMemo(() => {
        // Filter expenses for the requested month
        const monthExpenses = expenses.filter((e) => e.date.startsWith(month));

        // Total spent
        const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

        // Budget for the month (0 if not set)
        const budgetEntry = budgets.find((b) => b.month === month);
        const totalBudget = budgetEntry?.amount ?? 0;

        // Remaining
        const remaining = totalBudget - totalSpent;

        // By category
        const byCategory = {} as Record<ExpenseCategory, number>;
        for (const cat of ALL_CATEGORIES) {
            byCategory[cat] = 0;
        }
        for (const e of monthExpenses) {
            byCategory[e.category] += e.amount;
        }

        return { totalSpent, totalBudget, remaining, byCategory };
    }, [expenses, budgets, month]);
}
