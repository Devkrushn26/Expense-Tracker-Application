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

export function useExpenseSummary(month: string): ExpenseSummary {
    const expenses = useAppSelector((state) => state.expenses.expenses);
    const budgets = useAppSelector((state) => state.budget.budgets);

    return useMemo(() => {
        const monthExpenses = expenses.filter((e) => e.date.startsWith(month));

        const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

        const budgetEntry = budgets.find((b) => b.month === month);
        const totalBudget = budgetEntry?.amount ?? 0;

        const remaining = totalBudget - totalSpent;

        const byCategory = {} as Record<ExpenseCategory, number>;
        for (const cat of ALL_CATEGORIES) {
            byCategory[cat] = 0;
        }
        for (const e of monthExpenses) {
            byCategory[e.category] += e.amount;
        }

        return {
            totalSpent,
            totalBudget,
            remaining,
            byCategory,
        };
    }, [expenses, budgets, month]);
}
