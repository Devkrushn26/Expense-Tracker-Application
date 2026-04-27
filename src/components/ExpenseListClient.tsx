"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Expense } from "@/types/expense";
import ExpenseCard from "@/components/ExpenseCard";
import ExpenseFiltersBar from "@/components/ExpenseFiltersBar";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useFilteredExpenses } from "@/hooks/useFilteredExpenses";
import { deleteExpense, fetchExpenses } from "@/store/expenseSlice";

const PAGE_SIZE = 5;

export default function ExpenseListClient() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const filters = useAppSelector((state) => state.expenses.filters);
    const { filteredExpenses, count } = useFilteredExpenses();
    const [hasLoaded, setHasLoaded] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, filterKey: "" });
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
    const filterKey = useMemo(
        () =>
            JSON.stringify({
                category: filters.category,
                month: filters.month,
                search: filters.search,
                minAmount: filters.minAmount,
                maxAmount: filters.maxAmount,
            }),
        [
            filters.category,
            filters.month,
            filters.search,
            filters.minAmount,
            filters.maxAmount,
        ]
    );
    const page = pagination.filterKey === filterKey ? pagination.page : 1;

    const setCurrentPage = useCallback((updater: number | ((currentPage: number) => number)) => {
        setPagination((current) => {
            const currentPage = current.filterKey === filterKey ? current.page : 1;
            const nextPage = typeof updater === "function" ? updater(currentPage) : updater;

            return {
                page: nextPage,
                filterKey,
            };
        });
    }, [filterKey]);

    useEffect(() => {
        let active = true;

        dispatch(fetchExpenses({ ...filters, page, pageSize: PAGE_SIZE })).unwrap()
            .then((data) => {
                if (!active) return;
                setTotal(data.total);
                setTotalPages(data.totalPages);
                if (data.page > data.totalPages) {
                    setCurrentPage(data.totalPages);
                }
            })
            .catch(() => {
                if (!active) return;
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
        filters,
        filterKey,
        page,
        refreshKey,
        setCurrentPage,
        dispatch,
    ]);

    const handleEdit = (expense: Expense) => {
        router.push(`/expenses/${expense.id}/edit`);
    };

    const handleDelete = async (id: string) => {
        try {
            await dispatch(deleteExpense(id)).unwrap();

            if (filteredExpenses.length === 1 && page > 1) {
                setCurrentPage((currentPage) => currentPage - 1);
                return;
            }

            setRefreshKey((currentKey) => currentKey + 1);
        } catch { /* silently fail */ }
    };

    return (
        <>
            <ExpenseFiltersBar className="mb-6" />

            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Showing {count} of {total} expense{total !== 1 ? "s" : ""}
            </p>

            {!hasLoaded ? (
                <div className="glass-card p-10 text-center">
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading expenses...</p>
                </div>
            ) : filteredExpenses.length === 0 ? (
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

            {hasLoaded && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((currentPage) => Math.max(1, currentPage - 1))}
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
                       Total Expenses {total}   ||   Page {page} of {totalPages}     
                    </p>

                    <button
                        type="button"
                        onClick={() => setCurrentPage((currentPage) => Math.min(totalPages, currentPage + 1))}
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
