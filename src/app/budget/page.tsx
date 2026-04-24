"use client";

import { useEffect, useState, useCallback } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import BudgetProgressBar from "@/components/BudgetProgressBar";
import type { MonthlyBudget, Expense } from "@/types/expense";

export default function BudgetPage() {
    const { formatAmount } = useCurrency();

    const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const [formMonth, setFormMonth] = useState(new Date().toISOString().slice(0, 7));
    const [formAmount, setFormAmount] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [budgetRes, expenseRes] = await Promise.all([
                fetch("/api/budget"),
                fetch("/api/expenses"),
            ]);
            if (budgetRes.ok) {
                const data = await budgetRes.json();
                setBudgets(Array.isArray(data) ? data : [data]);
            }
            if (expenseRes.ok) setExpenses(await expenseRes.json());
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(formAmount);
        if (isNaN(amount) || amount < 0) {
            setMessage({ type: "error", text: "Amount must be 0 or greater" });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/budget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month: formMonth, amount: Math.round(amount * 100) }),
            });
            if (res.ok) {
                setMessage({ type: "success", text: "Budget saved!" });
                setFormAmount("");
                await fetchData();
            } else {
                const err = await res.json();
                setMessage({ type: "error", text: err.error || "Failed to save" });
            }
        } catch {
            setMessage({ type: "error", text: "Network error" });
        } finally {
            setSaving(false);
        }
    };

    const spentByMonth = (month: string) =>
        expenses.filter((e) => e.date.startsWith(month)).reduce((sum, e) => sum + e.amount, 0);

    return (
        <main className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
                Budget Management
            </h1>

            {/* Set budget form */}
            <section className="glass-card p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Set Monthly Budget
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Month
                        </label>
                        <input
                            type="month"
                            value={formMonth}
                            onChange={(e) => setFormMonth(e.target.value)}
                            className="rounded-lg px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Budget Amount
                        </label>
                        <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={formAmount}
                            onChange={(e) => setFormAmount(e.target.value)}
                            className="w-40 rounded-lg px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-5 py-2 text-sm"
                    >
                        {saving ? "Saving..." : "Save Budget"}
                    </button>
                </form>

                {message && (
                    <p className="mt-3 text-sm font-medium" style={{
                        color: message.type === "success" ? "#34d399" : "#f87171",
                    }}>
                        {message.text}
                    </p>
                )}
            </section>

            {/* Budget list */}
            <section>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Budget Overview
                </h2>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-card p-6">
                                <div className="skeleton h-4 w-24 mb-3" />
                                <div className="skeleton h-3 w-full" />
                            </div>
                        ))}
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="glass-card p-10 text-center">
                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No budgets set</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            Use the form above to set your first monthly budget
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {budgets.sort((a, b) => b.month.localeCompare(a.month)).map((b) => {
                            const spent = spentByMonth(b.month);
                            return (
                                <div key={b.month} className="glass-card p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{b.month}</h3>
                                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                            Spent {formatAmount(spent)} of {formatAmount(b.amount)}
                                        </div>
                                    </div>
                                    <BudgetProgressBar spent={spent} budget={b.amount} month={b.month} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
