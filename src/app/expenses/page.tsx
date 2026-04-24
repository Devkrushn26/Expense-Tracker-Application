import Link from "next/link";
import type { Expense } from "@/types/expense";
import ExpenseListClient from "@/components/ExpenseListClient";
import { getExpenses } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
    const expenses: Expense[] = getExpenses().sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Expenses
                </h1>
                <Link
                    href="/add"
                    className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
                >
                    + Add Expense
                </Link>
            </div>
            <ExpenseListClient initialExpenses={expenses} />
        </main>
    );
}
