"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { useCurrency } from "@/context/CurrencyContext";
import { useAppDispatch } from "@/hooks/useRedux";
import { deleteExpense, fetchExpenseById } from "@/store/expenseSlice";

// ─── Category Config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
    ExpenseCategory,
    { emoji: string; bg: string; text: string; border: string; glow: string }
> = {
    food:          { emoji: "🍔", bg: "rgba(249,115,22,0.12)",  text: "#fb923c", border: "#f97316", glow: "rgba(249,115,22,0.25)" },
    transport:     { emoji: "🚗", bg: "rgba(59,130,246,0.12)",  text: "#60a5fa", border: "#3b82f6", glow: "rgba(59,130,246,0.25)" },
    housing:       { emoji: "🏠", bg: "rgba(168,85,247,0.12)",  text: "#c084fc", border: "#a855f7", glow: "rgba(168,85,247,0.25)" },
    health:        { emoji: "💊", bg: "rgba(239,68,68,0.12)",   text: "#f87171", border: "#ef4444", glow: "rgba(239,68,68,0.25)" },
    entertainment: { emoji: "🎬", bg: "rgba(236,72,153,0.12)",  text: "#f472b6", border: "#ec4899", glow: "rgba(236,72,153,0.25)" },
    education:     { emoji: "📚", bg: "rgba(99,102,241,0.12)",  text: "#818cf8", border: "#6366f1", glow: "rgba(99,102,241,0.25)" },
    shopping:      { emoji: "🛍️", bg: "rgba(234,179,8,0.12)",   text: "#fbbf24", border: "#eab308", glow: "rgba(234,179,8,0.25)" },
    other:         { emoji: "📌", bg: "rgba(100,116,139,0.12)", text: "#94a3b8", border: "#64748b", glow: "rgba(100,116,139,0.25)" },
};

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function DetailSkeleton() {
    return (
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
            <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 8, marginBottom: "2rem" }} />
            <div style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 24,
                padding: "2rem",
                backdropFilter: "blur(20px)",
            }}>
                {/* Header skeleton */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "2rem" }}>
                    <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 16 }} />
                    <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ width: "60%", height: 28, borderRadius: 8, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: "30%", height: 16, borderRadius: 6 }} />
                    </div>
                    <div className="skeleton" style={{ width: 80, height: 40, borderRadius: 10 }} />
                </div>
                {/* Fields skeleton */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: 12,
                            padding: "1rem",
                        }}>
                            <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 6, marginBottom: 8 }} />
                            <div className="skeleton" style={{ width: "80%", height: 20, borderRadius: 6 }} />
                        </div>
                    ))}
                    <div style={{
                        gridColumn: "1 / -1",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 12,
                        padding: "1rem",
                    }}>
                        <div className="skeleton" style={{ width: 40, height: 12, borderRadius: 6, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: "50%", height: 20, borderRadius: 6 }} />
                    </div>
                </div>
            </div>
        </main>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ExpenseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const dispatch = useAppDispatch();
    const { formatAmount } = useCurrency();

    const [expense, setExpense] = useState<Expense | null>(null);
    const [status, setStatus] = useState<"loading" | "found" | "notfound" | "error">("loading");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!id) return;
        setStatus("loading");
        dispatch(fetchExpenseById(id)).unwrap()
            .then((data) => {
                setExpense(data);
                setStatus("found");
            })
            .catch((err) => setStatus(String(err).includes("not found") ? "notfound" : "error"));
    }, [dispatch, id]);

    async function handleDelete() {
        if (!expense) return;
        if (!confirm(`Delete "${expense.title}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await dispatch(deleteExpense(expense.id)).unwrap();
            router.push("/expenses");
        } finally {
            setDeleting(false);
        }
    }

    // ── States ───────────────────────────────────────────────────────────────

    if (status === "loading") return <DetailSkeleton />;

    if (status === "notfound") {
        return (
            <main style={{ maxWidth: 480, margin: "6rem auto", padding: "2rem 1rem", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                    Expense Not Found
                </h1>
                <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                    This expense doesn&apos;t exist or may have been deleted.
                </p>
                <Link href="/expenses" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "var(--gradient-brand)", color: "#fff",
                    padding: "10px 24px", borderRadius: 10, fontWeight: 600, textDecoration: "none",
                }}>
                    ← Back to Expenses
                </Link>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main style={{ maxWidth: 480, margin: "6rem auto", padding: "2rem 1rem", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                    Something went wrong
                </h1>
                <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                    Could not load the expense. Please try again.
                </p>
                <button onClick={() => setStatus("loading")} style={{
                    background: "var(--gradient-brand)", color: "#fff",
                    border: "none", padding: "10px 24px", borderRadius: 10,
                    fontWeight: 600, cursor: "pointer",
                }}>
                    Retry
                </button>
            </main>
        );
    }

    if (!expense) return null;

    const cat = CATEGORY_CONFIG[expense.category] ?? CATEGORY_CONFIG.other;

    // Formatted date
    const dateObj = new Date(expense.date + "T00:00:00");
    const formattedDate = dateObj.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const createdAt = new Date(expense.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

    return (
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>

            {/* Back nav */}
            <Link href="/expenses" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none",
                marginBottom: "1.75rem", transition: "color 0.2s",
            }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Expenses
            </Link>

            {/* Main card */}
            <div style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `1px solid ${cat.border}40`,
                borderRadius: 24,
                boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 60px ${cat.glow}`,
                overflow: "hidden",
            }}>

                {/* ── Header strip ── */}
                <div style={{
                    background: `linear-gradient(135deg, ${cat.bg}, transparent)`,
                    borderBottom: `1px solid ${cat.border}30`,
                    padding: "1.75rem 2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                }}>
                    {/* Category icon */}
                    <div style={{
                        width: 64, height: 64, borderRadius: 18,
                        background: cat.bg,
                        border: `1.5px solid ${cat.border}60`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 28,
                        boxShadow: `0 4px 20px ${cat.glow}`,
                        flexShrink: 0,
                    }}>
                        {cat.emoji}
                    </div>

                    {/* Title + badge */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{
                            margin: 0, fontSize: "1.5rem", fontWeight: 700,
                            color: "var(--text-primary)", lineHeight: 1.2,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                            {expense.title}
                        </h1>
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            marginTop: 6, padding: "3px 10px", borderRadius: 999,
                            background: cat.bg, color: cat.text,
                            fontSize: "0.75rem", fontWeight: 600,
                            border: `1px solid ${cat.border}40`,
                            textTransform: "capitalize",
                        }}>
                            {cat.emoji} {expense.category}
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <Link href={`/expenses/${id}/edit`} style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "9px 18px", borderRadius: 10,
                            background: "var(--gradient-brand)", color: "#fff",
                            fontWeight: 600, fontSize: "0.875rem", textDecoration: "none",
                            boxShadow: "0 2px 12px rgba(99,102,241,0.35)",
                            transition: "all 0.2s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(99,102,241,0.35)"; e.currentTarget.style.transform = "none"; }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                        </Link>
                        <button onClick={handleDelete} disabled={deleting} style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "9px 18px", borderRadius: 10,
                            background: "rgba(239,68,68,0.12)", color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.3)",
                            fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
                            transition: "all 0.2s", opacity: deleting ? 0.6 : 1,
                        }}
                            onMouseEnter={e => { if (!deleting) { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.transform = "none"; }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                            </svg>
                            {deleting ? "Deleting…" : "Delete"}
                        </button>
                    </div>
                </div>

                {/* ── Amount hero ── */}
                <div style={{
                    padding: "1.75rem 2rem",
                    borderBottom: "1px solid var(--border-subtle)",
                    textAlign: "center",
                }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                        Total Amount
                    </p>
                    <p style={{
                        fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
                        fontWeight: 800,
                        background: "var(--gradient-brand)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        margin: 0,
                        lineHeight: 1,
                    }}>
                        {formatAmount(expense.amount)}
                    </p>
                </div>

                {/* ── Detail fields ── */}
                <div style={{ padding: "1.75rem 2rem" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 12,
                    }}>

                        {/* Date */}
                        <DetailField
                            icon={<CalendarIcon />}
                            label="Date"
                            value={formattedDate}
                        />

                        {/* Category */}
                        <DetailField
                            icon={<TagIcon />}
                            label="Category"
                            value={
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    padding: "4px 12px", borderRadius: 999,
                                    background: cat.bg, color: cat.text,
                                    fontSize: "0.875rem", fontWeight: 600,
                                    border: `1px solid ${cat.border}40`,
                                    textTransform: "capitalize",
                                }}>
                                    {cat.emoji} {expense.category}
                                </span>
                            }
                        />

                        {/* Note – full width */}
                        <div style={{ gridColumn: "1 / -1" }}>
                            <DetailField
                                icon={<NoteIcon />}
                                label="Note"
                                value={expense.note || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No note added</span>}
                            />
                        </div>

                        {/* Expense ID */}
                        <div style={{ gridColumn: "1 / -1" }}>
                            <DetailField
                                icon={<IdIcon />}
                                label="Expense ID"
                                value={
                                    <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-muted)", wordBreak: "break-all" }}>
                                        {expense.id}
                                    </span>
                                }
                            />
                        </div>
                    </div>

                    {/* Created at footer */}
                    <p style={{
                        marginTop: "1.5rem", textAlign: "center",
                        color: "var(--text-muted)", fontSize: "0.78rem",
                    }}>
                        Created on {createdAt}
                    </p>
                </div>
            </div>
        </main>
    );
}

// ─── Detail Field Sub-component ──────────────────────────────────────────────

function DetailField({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 14,
            padding: "1rem 1.25rem",
            transition: "border-color 0.2s, background 0.2s",
        }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ color: "var(--text-muted)" }}>{icon}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {label}
                </span>
            </div>
            <div style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: "0.9rem" }}>
                {value}
            </div>
        </div>
    );
}

// ─── Mini Icons ──────────────────────────────────────────────────────────────

function CalendarIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function TagIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    );
}

function NoteIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    );
}

function IdIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
    );
}
