"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Expense } from "@/types/expense";
import ExpenseCard from "@/components/ExpenseCard";
import ExpenseFiltersBar from "@/components/ExpenseFiltersBar";
import { useAppSelector } from "@/hooks/useRedux";

const PAGE_SIZE = 5;

export default function ExpenseListClient() {
    const router = useRouter();
    const filters = useAppSelector((state) => state.expenses.filters);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;
        const params = new URLSearchParams();

        // Reset to page 1 when filters change
        const shouldResetPage = page !== 1;
        const currentPage = shouldResetPage ? 1 : page;
        
        params.set("page", String(currentPage));
        params.set("pageSize", String(PAGE_SIZE));

        if (filters.category && filters.category !== "all") {
            params.set("category", filters.category);
        }
        if (filters.month) {
            params.set("month", filters.month);
        }
        if (filters.search) {
            params.set("search", filters.search);
        }
        if (filters.minAmount !== null) {
            params.set("minAmount", String(filters.minAmount));
        }
        if (filters.maxAmount !== null) {
            params.set("maxAmount", String(filters.maxAmount));
        }

        fetch(`/api/expenses?${params.toString()}`, { cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch expenses");
                return res.json() as Promise<{
                    items: Expense[];
                    total: number;
                    page: number;
                    pageSize: number;
                    totalPages: number;
                }>;
            })
            .then((data) => {
                if (!active) return;
                setExpenses(data.items);
                setTotal(data.total);
                setTotalPages(data.totalPages);
                if (data.page > data.totalPages) {
                    setPage(data.totalPages);
                }
            })
            .catch(() => {
                if (!active) return;
                setExpenses([]);
                setTotal(0);
                setTotalPages(1);
            })
            .finally(() => {
                if (active) setHasLoaded(true);
            });

        return () => {
            active = false;
        };
    }, [
        filters.category,
        filters.month,
        filters.search,
        filters.minAmount,
        filters.maxAmount,
        page,
        refreshKey,
    ]);

    const handleEdit = (expense: Expense) => {
        router.push(`/expenses/${expense.id}/edit`);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (!res.ok) return;

            if (expenses.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1);
                return;
            }

            setRefreshKey((currentKey) => currentKey + 1);
        } catch { /* silently fail */ }
    };

    return (
        <>
            <ExpenseFiltersBar className="mb-6" />

            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Showing {expenses.length} of {total} expense{total !== 1 ? "s" : ""}
            </p>

            {!hasLoaded ? (
                <div className="glass-card p-10 text-center">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading expenses...</p>
                </div>
            ) : expenses.length === 0 ? (
                <div className="glass-card p-10 text-center">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No expenses found</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Try adjusting your filters or add a new expense
                    </p>
                </div>
            ) : (
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
            )}

            {hasLoaded && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                        disabled={page === 1}
                        className="rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                        style={{
                            background: "var(--bg-card)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-subtle)",
                        }}
                    >
                        Previous
                    </button>

                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Page {page} of {totalPages}
                    </p>

                    <button
                        type="button"
                        onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                        disabled={page === totalPages}
                        className="rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                        style={{
                            background: "var(--bg-card)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-subtle)",
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
}
