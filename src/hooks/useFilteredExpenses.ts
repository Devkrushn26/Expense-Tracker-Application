import { useMemo } from "react";
import { useAppSelector } from "./useRedux";
import type { Expense } from "@/types/expense";


export function useFilteredExpenses(): {
    filteredExpenses: Expense[];
    count: number;
} {
    const expenses = useAppSelector((state) => state.expenses.expenses);
    const filters = useAppSelector((state) => state.expenses.filters);

    return useMemo(() => {
        let result = [...expenses];

        // Category
        if (filters.category && filters.category !== "all") {
            result = result.filter((e) => e.category === filters.category);
        }

        // Month
        if (filters.month) {
            result = result.filter((e) => e.date.startsWith(filters.month));
        }

        // Search (title or note)
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    (e.note && e.note.toLowerCase().includes(q))
            );
        }

        // Min amount
        if (filters.minAmount !== null) {
            result = result.filter((e) => e.amount >= filters.minAmount!);
        }

        // Max amount
        if (filters.maxAmount !== null) {
            result = result.filter((e) => e.amount <= filters.maxAmount!);
        }

        return { filteredExpenses: result, count: result.length };
    }, [expenses, filters]);
}
