"use client";

import { useEffect, useState, useCallback } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import type { MonthlyBudget, Expense } from "@/types/expense";
import { useAppDispatch } from "@/hooks/useRedux";
import { deleteBudget, fetchBudget, fetchBudgets, setBudget } from "@/store/budgetSlice";
import { fetchExpenses } from "@/store/expenseSlice";
import BudgetProgressBar from "@/components/BudgetProgressBar";

// ─── Exchange rates (mirrored from CurrencyContext) ───────────────────────────
// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label style={{
            display: "block", fontSize: "0.7rem", fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase",
            color: "var(--text-muted)", marginBottom: 6,
        }}>
            {children}
        </label>
    );
}

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
    return {
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        color: "var(--text-primary)",
        borderRadius: 10, padding: "9px 12px", fontSize: "0.875rem",
        outline: "none", width: "100%", boxSizing: "border-box",
        transition: "border-color 0.2s, box-shadow 0.2s",
        ...extra,
    };
}

function focusIn(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "#6366f1";
    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
}
function focusOut(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--border-default)";
    e.target.style.boxShadow = "none";
}

function formatBudgetMonth(month: string) {
    return new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Budget card with inline edit ─────────────────────────────────────────────

interface BudgetCardProps {
    budget: MonthlyBudget;
    spent: number;
    onSave: (month: string, newAmount: number) => Promise<void>;
    onDelete: (month: string) => Promise<void>;
    currencySymbol: string;
    currency: string;
    formatAmount: (amount: number) => string;
    toUsdAmount: (v: number) => number;
    fromUsdAmount: (amount: number) => number;
}

function BudgetCard({ budget, spent, onSave, onDelete, currencySymbol, currency, formatAmount, toUsdAmount, fromUsdAmount }: BudgetCardProps) {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Convert stored USD cents → active currency for display in the input
    const localAmount = fromUsdAmount(budget.amount);
    const pct = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
    const over = budget.amount > 0 && spent > budget.amount;

    function startEdit() {
        setEditValue(localAmount.toFixed(2));
        setEditing(true);
    }

    async function handleSave() {
        const v = parseFloat(editValue);
        if (isNaN(v) || v < 0) return;
        setSaving(true);
        await onSave(budget.month, toUsdAmount(v));
        setSaving(false);
        setEditing(false);
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            await onDelete(budget.month);
            setDeleteModalOpen(false);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${over ? "rgba(239,68,68,0.3)" : pct >= 70 ? "rgba(245,158,11,0.3)" : "var(--glass-border)"}`,
            borderRadius: 16,
            padding: "1.25rem 1.5rem",
            transition: "border-color 0.3s",
        }}>
            {/* Row 1: month + actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                    <span style={{
                        fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)",
                    }}>
                        {formatBudgetMonth(budget.month)}
                    </span>
                    <span style={{
                        marginLeft: 10, fontSize: "0.7rem", fontWeight: 600,
                        padding: "2px 8px", borderRadius: 999,
                        background: over ? "rgba(239,68,68,0.12)" : pct >= 70 ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                        color: over ? "#f87171" : pct >= 70 ? "#fbbf24" : "#34d399",
                    }}>
                        {pct.toFixed(0)}% used
                    </span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    {!editing && (
                        <button onClick={startEdit} style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                            background: "rgba(99,102,241,0.1)", color: "#818cf8",
                            border: "1px solid rgba(99,102,241,0.25)", fontSize: "0.8rem", fontWeight: 600,
                            transition: "all 0.2s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.2)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                        </button>
                    )}
                    <button onClick={() => setDeleteModalOpen(true)} disabled={deleting} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                        background: "rgba(239,68,68,0.1)", color: "#f87171",
                        border: "1px solid rgba(239,68,68,0.25)", fontSize: "0.8rem", fontWeight: 600,
                        transition: "all 0.2s", opacity: deleting ? 0.6 : 1,
                    }}
                        onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                        {deleting ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>

            {deleteModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`delete-budget-title-${budget.month}`}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                        background: "rgba(2,6,23,0.72)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                    }}
                    onClick={() => {
                        if (!deleting) setDeleteModalOpen(false);
                    }}
                >
                    <div
                        style={{
                            width: "min(420px, 100%)",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--glass-border)",
                            borderRadius: 16,
                            boxShadow: "var(--shadow-lg)",
                            padding: "1.25rem",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            id={`delete-budget-title-${budget.month}`}
                            style={{
                                fontSize: "1rem",
                                fontWeight: 800,
                                color: "var(--text-primary)",
                                marginBottom: 8,
                            }}
                        >
                            Delete budget?
                        </h3>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.9rem",
                                lineHeight: 1.5,
                                marginBottom: 18,
                            }}
                        >
                            Delete budget for {formatBudgetMonth(budget.month)}? This cannot be undone.
                        </p>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                disabled={deleting}
                                style={{
                                    padding: "9px 14px",
                                    borderRadius: 10,
                                    cursor: deleting ? "not-allowed" : "pointer",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid var(--border-default)",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                    opacity: deleting ? 0.6 : 1,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{
                                    padding: "9px 14px",
                                    borderRadius: 10,
                                    cursor: deleting ? "not-allowed" : "pointer",
                                    background: "rgba(239,68,68,0.14)",
                                    border: "1px solid rgba(239,68,68,0.35)",
                                    color: "#f87171",
                                    fontSize: "0.85rem",
                                    fontWeight: 800,
                                    opacity: deleting ? 0.7 : 1,
                                }}
                            >
                                {deleting ? "Deleting..." : "Delete budget"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline edit form */}
            {editing && (
                <div style={{
                    marginBottom: 14,
                    padding: "12px 14px",
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 10,
                }}>
                    <div style={{ flex: 1 }}>
                        <FieldLabel>New Amount ({currencySymbol} {currency})</FieldLabel>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                                color: "var(--text-muted)", fontWeight: 700, fontSize: "0.85rem", pointerEvents: "none",
                            }}>{currencySymbol}</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                                style={inputStyle({ paddingLeft: 28 })}
                                onFocus={focusIn}
                                onBlur={focusOut}
                            />
                        </div>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="btn-primary" style={{
                        padding: "9px 16px", fontSize: "0.85rem", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 6,
                        opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer",
                        flexShrink: 0,
                    }}>
                        {saving ? (
                            <span style={{
                                width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                                borderTopColor: "#fff", borderRadius: "50%",
                                display: "inline-block", animation: "spin 0.7s linear infinite",
                            }} />
                        ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                        {saving ? "Saving…" : "Save"}
                    </button>
                    <button onClick={() => setEditing(false)} style={{
                        padding: "9px 14px", borderRadius: 10, cursor: "pointer",
                        background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-default)",
                        color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600,
                        flexShrink: 0,
                    }}>
                        Cancel
                    </button>
                </div>
            )}

            <BudgetProgressBar 
                spent={spent} 
                budget={budget.amount} 
                month={formatBudgetMonth(budget.month)} 
            />
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BudgetPage() {
    const { formatAmount, currencySymbol, toUsdAmount, fromUsdAmount, currency } = useCurrency();
    const dispatch = useAppDispatch();

    const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    // Add-new form
    const [formMonth, setFormMonth] = useState(new Date().toISOString().slice(0, 7));
    const [formAmount, setFormAmount] = useState("");
    const [saving, setSaving] = useState(false);
    const [loadingMonthBudget, setLoadingMonthBudget] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [budgetSearchMonth, setBudgetSearchMonth] = useState("");
    const [searchedBudget, setSearchedBudget] = useState<MonthlyBudget | null>(null);
    const [loadingBudgetSearch, setLoadingBudgetSearch] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [fetchedBudgets, fetchedExpenses] = await Promise.all([
                dispatch(fetchBudgets()).unwrap(),
                dispatch(fetchExpenses(undefined)).unwrap(),
            ]);
            setBudgets(fetchedBudgets);
            setExpenses(fetchedExpenses.items);
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const fetchBudgetByMonth = useCallback(async (month: string) => {
        setLoadingBudgetSearch(true);
        try {
            setSearchedBudget(await dispatch(fetchBudget(month)).unwrap());
        } catch {
            setSearchedBudget(null);
        } finally {
            setLoadingBudgetSearch(false);
        }
    }, [dispatch]);

    useEffect(() => {
        if (budgetSearchMonth) {
            void fetchBudgetByMonth(budgetSearchMonth);
        }
    }, [budgetSearchMonth, fetchBudgetByMonth]);

    useEffect(() => {
        if (!formMonth) return;

        let active = true;
        setLoadingMonthBudget(true);

        dispatch(fetchBudget(formMonth)).unwrap()
            .then((budget) => {
                if (!active) return;
                setFormAmount(budget.amount > 0 ? fromUsdAmount(budget.amount).toFixed(2) : "");
            })
            .catch(() => {
                if (active) setFormAmount("");
            })
            .finally(() => {
                if (active) setLoadingMonthBudget(false);
            });

        return () => {
            active = false;
        };
    }, [dispatch, formMonth, fromUsdAmount]);

    // ── Add new budget ────────────────────────────────────────────────────────
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
            await dispatch(setBudget({ month: formMonth, amount: toUsdAmount(amount) })).unwrap();
            setMessage({ type: "success", text: `Budget for ${formMonth} saved!` });
            setFormAmount("");
            await fetchData();
            if (budgetSearchMonth === formMonth) {
                await fetchBudgetByMonth(formMonth);
            }
        } catch (err) {
            setMessage({ type: "error", text: (err as Error).message || "Failed to save" });
        } finally {
            setSaving(false);
        }
    };

    // ── Inline save (update existing) ────────────────────────────────────────
    const handleSave = async (month: string, newAmount: number) => {
        await dispatch(setBudget({ month, amount: newAmount })).unwrap();
        await fetchData();
        if (budgetSearchMonth === month) {
            await fetchBudgetByMonth(month);
        }
    };

    // ── Delete budget ─────────────────────────────────────────────────────────
    const handleDelete = async (month: string) => {
        await dispatch(deleteBudget(month)).unwrap();
        await fetchData();
        if (budgetSearchMonth === month) {
            setSearchedBudget({ month, amount: 0 });
        }
    };

    const spentByMonth = (month: string) =>
        expenses.filter((e) => e.date.startsWith(month)).reduce((sum, e) => sum + e.amount, 0);

    const sortedBudgets = [...budgets].sort((a, b) => b.month.localeCompare(a.month));
    const searchedBudgetExists =
        searchedBudget !== null &&
        (searchedBudget.amount > 0 || budgets.some((budget) => budget.month === searchedBudget.month));
    const visibleBudgets = budgetSearchMonth
        ? searchedBudgetExists && searchedBudget
            ? [searchedBudget]
            : []
        : sortedBudgets;

    return (
        <main style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem" }}>

            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2rem" }}>
                💰 Budget Management
            </h1>

            {/* ── Add / Set budget form ── */}
            <div style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--glass-border)",
                borderRadius: 20,
                padding: "1.5rem",
                marginBottom: "2rem",
                boxShadow: "var(--shadow-md)",
            }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                    Set Monthly Budget
                </h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                    {/* Month */}
                    <div style={{ minWidth: 150 }}>
                        <FieldLabel>Month</FieldLabel>
                        <input
                            type="month"
                            value={formMonth}
                            onChange={(e) => setFormMonth(e.target.value)}
                            required
                            style={inputStyle({ colorScheme: "dark" })}
                            onFocus={focusIn}
                            onBlur={focusOut}
                        />
                    </div>

                    {/* Amount */}
                    <div style={{ minWidth: 160 }}>
                        <FieldLabel>Amount ({currencySymbol} {currency})</FieldLabel>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                                color: "var(--text-muted)", fontWeight: 700, fontSize: "0.85rem", pointerEvents: "none",
                            }}>{currencySymbol}</span>
                            <input
                                type="number"
                                placeholder={loadingMonthBudget ? "Loading..." : "0.00"}
                                step="0.01"
                                min="0"
                                value={formAmount}
                                onChange={(e) => setFormAmount(e.target.value)}
                                disabled={loadingMonthBudget}
                                required
                                style={inputStyle({ paddingLeft: 28, opacity: loadingMonthBudget ? 0.7 : 1 })}
                                onFocus={focusIn}
                                onBlur={focusOut}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary" style={{
                        padding: "10px 20px", fontSize: "0.875rem", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 8,
                        opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer",
                    }}>
                        {saving ? (
                            <span style={{
                                width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                                borderTopColor: "#fff", borderRadius: "50%",
                                display: "inline-block", animation: "spin 0.7s linear infinite",
                            }} />
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                            </svg>
                        )}
                        {saving ? "Saving…" : "Save Budget"}
                    </button>
                </form>

                {message && (
                    <div style={{
                        marginTop: 12, padding: "10px 14px", borderRadius: 10, fontSize: "0.875rem", fontWeight: 500,
                        background: message.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                        color: message.type === "success" ? "#34d399" : "#f87171",
                    }}>
                        {message.type === "success" ? "✅" : "⚠️"} {message.text}
                    </div>
                )}
            </div>

            {/* ── Budget list ── */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        Budget Overview
                    </h2>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                        <div style={{ minWidth: 150 }}>
                            <FieldLabel>Search month</FieldLabel>
                            <input
                                type="month"
                                value={budgetSearchMonth}
                                onChange={(e) => {
                                    setBudgetSearchMonth(e.target.value);
                                    if (!e.target.value) setSearchedBudget(null);
                                }}
                                style={inputStyle({ colorScheme: "dark" })}
                                onFocus={focusIn}
                                onBlur={focusOut}
                            />
                        </div>
                        {budgetSearchMonth && (
                            <button
                                type="button"
                                onClick={() => {
                                    setBudgetSearchMonth("");
                                    setSearchedBudget(null);
                                }}
                                style={{
                                    padding: "9px 14px",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid var(--border-default)",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading || loadingBudgetSearch ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ borderRadius: 16, padding: "1.25rem 1.5rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <div className="skeleton" style={{ width: "30%", height: 16, borderRadius: 6, marginBottom: 12 }} />
                                <div className="skeleton" style={{ width: "100%", height: 10, borderRadius: 999 }} />
                            </div>
                        ))}
                    </div>
                ) : visibleBudgets.length === 0 ? (
                    <div style={{
                        background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                        borderRadius: 16, padding: "3rem", textAlign: "center",
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", fontWeight: 600 }}>
                            {budgetSearchMonth ? `No budget found for ${formatBudgetMonth(budgetSearchMonth)}` : "No budgets set yet"}
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
                            {budgetSearchMonth ? "Clear the search or set a budget for this month above" : "Use the form above to set your first monthly budget"}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {visibleBudgets.map((b) => (
                            <BudgetCard
                                key={b.month}
                                budget={b}
                                spent={spentByMonth(b.month)}
                                onSave={handleSave}
                                onDelete={handleDelete}
                                currencySymbol={currencySymbol}
                                currency={currency}
                                formatAmount={formatAmount}
                                toUsdAmount={toUsdAmount}
                                fromUsdAmount={fromUsdAmount}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
}
