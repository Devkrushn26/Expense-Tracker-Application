"use client";

import { useState, useRef, useEffect } from "react";
import type { Expense } from "@/types/expense";
import { useCurrency } from "@/context/CurrencyContext";
import CategoryBadge, { CATEGORY_CONFIG } from "./CategoryBadge";

interface ExpenseCardProps {
    expense: Expense;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
    className?: string;
}

export default function ExpenseCard({
    expense,
    onEdit,
    onDelete,
    className = "",
}: ExpenseCardProps) {
    const { formatAmount } = useCurrency();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const catConfig = CATEGORY_CONFIG[expense.category];

    return (
        <div
            className={`glass-card relative flex items-center gap-4 p-4 ${className}`}
            style={{
                borderLeft: `3px solid ${catConfig.border}`,
            }}
        >
            {/* Category emoji */}
            <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ background: catConfig.bg }}
            >
                {catConfig.emoji}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {expense.title}
                    </h3>
                    <CategoryBadge category={expense.category} size="sm" />
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{expense.date}</span>
                    {expense.note && (
                        <span className="truncate max-w-[200px]">• {expense.note}</span>
                    )}
                </div>
            </div>

            {/* Amount */}
            <div className="shrink-0 text-right">
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatAmount(expense.amount)}
                </p>
            </div>

            {/* Actions dropdown */}
            <div className="relative shrink-0" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="rounded-lg p-1.5 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-elevated)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                    aria-label="Actions"
                >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>

                {menuOpen && (
                    <div
                        className="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl py-1"
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-default)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <button
                            onClick={() => { onEdit(expense); setMenuOpen(false); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                e.currentTarget.style.color = '#a78bfa';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={() => { onDelete(expense.id); setMenuOpen(false); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.color = '#f87171';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            🗑️ Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
