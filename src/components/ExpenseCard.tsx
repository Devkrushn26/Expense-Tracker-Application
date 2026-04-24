"use client";

import Link from "next/link";
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
   
    const wrapperRef = useRef<HTMLDivElement>(null);

   
    useEffect(() => {
        if (!menuOpen) return;
        function onOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        
        document.addEventListener("mousedown", onOutside, true);
        return () => document.removeEventListener("mousedown", onOutside, true);
    }, [menuOpen]);

    const catConfig = CATEGORY_CONFIG[expense.category];

    return (
        <div
            className={`glass-card relative flex items-center gap-4 p-4 ${className}`}
            style={{
                borderLeft: `3px solid ${catConfig.border}`,
                overflow: "visible",
               
                zIndex: menuOpen ? 50 : "auto",
            }}
        >
            {/* ── Clickable expense row ── */}
            <Link
                href={`/expenses/${expense.id}`}
                className="flex min-w-0 flex-1 items-center gap-4 rounded-lg"
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
                        <h3 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {expense.title}
                        </h3>
                        <CategoryBadge category={expense.category} size="sm" />
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span>{expense.date}</span>
                        {expense.note && (
                            <span className="truncate max-w-[200px]">• {expense.note}</span>
                        )}
                    </div>
                </div>

                {/* Amount */}
                <div className="shrink-0 text-right">
                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                        {formatAmount(expense.amount)}
                    </p>
                </div>
            </Link>

            {/* ── Three-dot menu wrapper (position: relative so dropdown anchors to it) ── */}
            <div
                ref={wrapperRef}
                className="relative shrink-0"
                // Stop the Link's click from firing when interacting with this area
                onClick={(e) => e.preventDefault()}
            >
                {/* Toggle button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen((prev) => !prev);
                    }}
                    className="rounded-lg p-1.5 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-elevated)";
                        e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-muted)";
                    }}
                    aria-label="Actions"
                    aria-expanded={menuOpen}
                >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>

                {/* Dropdown — absolutely anchored to the wrapper, no JS coordinate math needed */}
                {menuOpen && (
                    <div
                        style={{
                            position: "absolute",
                            right: 0,
                            top: "calc(100% + 6px)",
                            zIndex: 9999,
                            width: 152,
                            borderRadius: 12,
                            padding: "4px 0",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-default)",
                            boxShadow: "var(--shadow-lg)",
                        }}
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(expense);
                                setMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
                                e.currentTarget.style.color = "#a78bfa";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "var(--text-secondary)";
                            }}
                        >
                            ✏️ Edit
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(expense.id);
                                setMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                                e.currentTarget.style.color = "#f87171";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "var(--text-secondary)";
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
