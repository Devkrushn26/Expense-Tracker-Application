"use client";

import { useRouter } from "next/navigation";
import type { Expense } from "@/types/expense";
import ExpenseCard from "@/components/ExpenseCard";
import ExpenseFiltersBar from "@/components/ExpenseFiltersBar";
import { useFilteredExpenses } from "@/hooks/useFilteredExpenses";
import { useAppDispatch } from "@/hooks/useRedux";
import { setExpenses, removeExpense } from "@/store/expenseSlice";
import { useEffect } from "react";

interface ExpenseListClientProps {
    initialExpenses: Expense[];
}

export default function ExpenseListClient({ initialExpenses }: ExpenseListClientProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { filteredExpenses, count } = useFilteredExpenses();

    useEffect(() => { dispatch(setExpenses(initialExpenses)); }, [dispatch, initialExpenses]);

    const handleEdit = (expense: Expense) => {
        router.push(`/expenses/${expense.id}/edit`);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (res.ok) dispatch(removeExpense(id));
        } catch { /* silently fail */ }
    };

    return (
        <>
            <ExpenseFiltersBar className="mb-6" />

            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Showing {count} expense{count !== 1 ? "s" : ""}
            </p>

            {filteredExpenses.length === 0 ? (
                <div className="glass-card p-10 text-center">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No expenses found</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Try adjusting your filters or add a new expense
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredExpenses.map((expense) => (
                        <ExpenseCard
                            key={expense.id}
                            expense={expense}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
