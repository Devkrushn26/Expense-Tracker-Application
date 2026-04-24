"use client";

import { useRouter } from "next/navigation";
import type { Expense } from "@/types/expense";
import ExpenseCard from "./ExpenseCard";

interface RecentExpensesProps {
    expenses: Expense[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
    const router = useRouter();

    const handleEdit = (expense: Expense) => {
        router.push(`/expenses/${expense.id}/edit`);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (res.ok) {
                router.refresh();
            }
        } catch {
            // silently fail
        }
    };

    if (expenses.length === 0) {
        return (
            <div className="glass-card p-10 text-center">
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No recent expenses</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Add your first expense to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {expenses.map((expense) => (
                <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
}
