"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setFilters, clearFilters } from "@/store/expenseSlice";
import type { ExpenseCategory } from "@/types/expense";
import { useMemo, useState } from "react";

const CATEGORIES: ExpenseCategory[] = [
    "food",
    "transport",
    "housing",
    "health",
    "entertainment",
    "education",
    "shopping",
    "other",
];

interface ExpenseFiltersBarProps {
    className?: string;
}

export default function ExpenseFiltersBar({ className = "" }: ExpenseFiltersBarProps) {
    const dispatch = useAppDispatch();
    const filters = useAppSelector((state) => state.expenses.filters);
    const { currencySymbol, toUsdAmount } = useCurrency();
    const [minAmountInput, setMinAmountInput] = useState("");
    const [maxAmountInput, setMaxAmountInput] = useState("");

    const activeCount = useMemo(() => {
        let count = 0;
        if (filters.category !== "all") count++;
        if (filters.month) count++;
        if (filters.search) count++;
        if (filters.minAmount !== null) count++;
        if (filters.maxAmount !== null) count++;
        return count;
    }, [filters]);

    const getAmountFilter = (value: string) => {
        if (!value.trim()) return null;

        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) return null;

        return toUsdAmount(numericValue);
    };

    const resetFilters = () => {
        setMinAmountInput("");
        setMaxAmountInput("");
        dispatch(clearFilters());
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    placeholder="Search expenses..."
                    value={filters.search}
                    onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                    className="rounded-lg px-3 py-2 text-sm w-full sm:w-64"
                />

                <select
                    value={filters.category}
                    onChange={(e) =>
                        dispatch(setFilters({ category: e.target.value as ExpenseCategory | "all" }))
                    }
                    className="rounded-lg px-3 py-2 text-sm"
                >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                    ))}
                </select>

                <input
                    type="month"
                    value={filters.month}
                    onChange={(e) => dispatch(setFilters({ month: e.target.value }))}
                    className="rounded-lg px-3 py-2 text-sm"
                />

                <input
                    type="text"
                    inputMode="decimal"
                    placeholder={`Min (${currencySymbol})`}
                    value={minAmountInput}
                    onChange={(e) => {
                        setMinAmountInput(e.target.value);
                        dispatch(setFilters({ minAmount: getAmountFilter(e.target.value) }));
                    }}
                    className="w-24 rounded-lg px-3 py-2 text-sm"
                />
                <input
                    type="text"
                    inputMode="decimal"
                    placeholder={`Max (${currencySymbol})`}
                    value={maxAmountInput}
                    onChange={(e) => {
                        setMaxAmountInput(e.target.value);
                        dispatch(setFilters({ maxAmount: getAmountFilter(e.target.value) }));
                    }}
                    className="w-24 rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {activeCount > 0 && (
                <div className="flex items-center gap-3 text-sm">
                    <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            color: "#a78bfa",
                        }}
                    >
                        {activeCount} filter{activeCount !== 1 ? "s" : ""} active
                    </span>
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs font-medium transition-colors"
                        style={{ color: "#818cf8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#818cf8")}
                    >
                        Reset all x
                    </button>
                </div>
            )}
        </div>
    );
}
