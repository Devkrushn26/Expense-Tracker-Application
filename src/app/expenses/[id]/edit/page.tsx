"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { useCurrency } from "@/context/CurrencyContext";

// ─── Category Config ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
    ExpenseCategory,
    { emoji: string; label: string; bg: string; text: string; border: string }
> = {
    food:          { emoji: "🍔", label: "Food",          bg: "rgba(249,115,22,0.12)",  text: "#fb923c", border: "#f97316" },
    transport:     { emoji: "🚗", label: "Transport",     bg: "rgba(59,130,246,0.12)",  text: "#60a5fa", border: "#3b82f6" },
    housing:       { emoji: "🏠", label: "Housing",       bg: "rgba(168,85,247,0.12)",  text: "#c084fc", border: "#a855f7" },
    health:        { emoji: "💊", label: "Health",        bg: "rgba(239,68,68,0.12)",   text: "#f87171", border: "#ef4444" },
    entertainment: { emoji: "🎬", label: "Entertainment", bg: "rgba(236,72,153,0.12)",  text: "#f472b6", border: "#ec4899" },
    education:     { emoji: "📚", label: "Education",     bg: "rgba(99,102,241,0.12)",  text: "#818cf8", border: "#6366f1" },
    shopping:      { emoji: "🛍️", label: "Shopping",      bg: "rgba(234,179,8,0.12)",   text: "#fbbf24", border: "#eab308" },
    other:         { emoji: "📌", label: "Other",         bg: "rgba(100,116,139,0.12)", text: "#94a3b8", border: "#64748b" },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as ExpenseCategory[];

// Exchange rates (mirrors CurrencyContext — must stay in sync)
const EXCHANGE_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
};

// ─── Field label helper ───────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label style={{
            display: "block",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 8,
        }}>
            {children}
        </label>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EditExpensePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const { currencySymbol, toUsdCents, currency } = useCurrency();

    const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>("food");
    const [date, setDate] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // ── Pre-fill form with existing expense data ──────────────────────────────
    useEffect(() => {
        if (!id) return;
        fetch(`/api/expenses/${id}`)
            .then(async (res) => {
                if (!res.ok) throw new Error("Not found");
                const data: Expense = await res.json();
                setTitle(data.title);
                // Convert stored USD cents → local currency value for display
                const localAmount = (data.amount / 100) * (EXCHANGE_RATES[currency] ?? 1);
                setAmount(localAmount.toFixed(2));
                setCategory(data.category);
                setDate(data.date);
                setNote(data.note ?? "");
                setLoadStatus("ready");
            })
            .catch(() => setLoadStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // intentionally only run on mount; currency change will update the displayed value via the label

    // ── Submit handler ────────────────────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError("");

        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    // Convert local-currency input back to USD cents
                    amount: toUsdCents(parseFloat(amount)),
                    category,
                    date,
                    note: note.trim() || undefined,
                }),
            });

            if (res.ok) {
                router.push(`/expenses/${id}`);
            } else {
                const body = await res.json();
                setSubmitError(body.error || "Failed to save changes.");
            }
        } catch {
            setSubmitError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // ── Selected category config ──────────────────────────────────────────────
    const cat = CATEGORY_CONFIG[category];

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loadStatus === "loading") {
        return (
            <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
                <div className="skeleton" style={{ width: 120, height: 18, borderRadius: 8, marginBottom: "2rem" }} />
                <div style={{
                    background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                    borderRadius: 24, padding: "2rem", backdropFilter: "blur(20px)",
                }}>
                    <div className="skeleton" style={{ width: "40%", height: 32, borderRadius: 8, marginBottom: "2rem" }} />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ marginBottom: 20 }}>
                            <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 6, marginBottom: 8 }} />
                            <div className="skeleton" style={{ width: "100%", height: 44, borderRadius: 10 }} />
                        </div>
                    ))}
                </div>
            </main>
        );
    }

    if (loadStatus === "error") {
        return (
            <main style={{ maxWidth: 480, margin: "6rem auto", padding: "2rem 1rem", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                    Expense Not Found
                </h1>
                <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                    Could not load the expense details.
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

    // ── Form ──────────────────────────────────────────────────────────────────
    return (
        <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>

            {/* Back nav */}
            <Link href={`/expenses/${id}`} style={{
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
                Back to Expense
            </Link>

            {/* Card */}
            <div style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `1px solid ${cat.border}40`,
                borderRadius: 24,
                boxShadow: `0 8px 40px rgba(0,0,0,0.4)`,
                overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{
                    background: `linear-gradient(135deg, ${cat.bg}, transparent)`,
                    borderBottom: "1px solid var(--border-subtle)",
                    padding: "1.5rem 2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: cat.bg, border: `1.5px solid ${cat.border}60`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, flexShrink: 0,
                    }}>
                        {cat.emoji}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            Edit Expense
                        </h1>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                            Update the details below and save your changes
                        </p>
                    </div>
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit} style={{ padding: "1.75rem 2rem" }}>

                    {/* Title */}
                    <div style={{ marginBottom: 20 }}>
                        <FieldLabel>Title</FieldLabel>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What did you spend on?"
                            style={{
                                width: "100%", boxSizing: "border-box",
                                padding: "11px 14px", borderRadius: 10,
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-default)",
                                color: "var(--text-primary)", fontSize: "0.9rem",
                                outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = "#6366f1";
                                e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = "var(--border-default)";
                                e.target.style.boxShadow = "none";
                            }}
                        />
                    </div>

                    {/* Amount + Date row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                        <div>
                            <FieldLabel>Amount ({currencySymbol} {currency})</FieldLabel>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                                    color: "var(--text-muted)", fontWeight: 600, fontSize: "0.9rem", pointerEvents: "none",
                                }}>
                                    {currencySymbol}
                                </span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    style={{
                                        width: "100%", boxSizing: "border-box",
                                        padding: "11px 14px", paddingLeft: 28, borderRadius: 10,
                                        background: "var(--bg-card)",
                                        border: "1px solid var(--border-default)",
                                        color: "var(--text-primary)", fontSize: "0.9rem",
                                        outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                                    }}
                                    onFocus={e => {
                                        e.target.style.borderColor = "#6366f1";
                                        e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = "var(--border-default)";
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <FieldLabel>Date</FieldLabel>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{
                                    width: "100%", boxSizing: "border-box",
                                    padding: "11px 14px", borderRadius: 10,
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border-default)",
                                    color: "var(--text-primary)", fontSize: "0.9rem",
                                    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                                    colorScheme: "dark",
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = "#6366f1";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = "var(--border-default)";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                    </div>

                    {/* Category grid */}
                    <div style={{ marginBottom: 20 }}>
                        <FieldLabel>Category</FieldLabel>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 8,
                        }}>
                            {CATEGORIES.map((cat) => {
                                const cfg = CATEGORY_CONFIG[cat];
                                const isSelected = category === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 4,
                                            padding: "10px 6px",
                                            borderRadius: 12,
                                            border: `1.5px solid ${isSelected ? cfg.border : "var(--border-subtle)"}`,
                                            background: isSelected ? cfg.bg : "rgba(255,255,255,0.02)",
                                            color: isSelected ? cfg.text : "var(--text-muted)",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                            fontSize: "0.75rem",
                                            fontWeight: isSelected ? 700 : 500,
                                        }}
                                    >
                                        <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
                                        <span style={{ textTransform: "capitalize" }}>{cfg.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Note */}
                    <div style={{ marginBottom: 24 }}>
                        <FieldLabel>Note <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Add a note about this expense..."
                            style={{
                                width: "100%", boxSizing: "border-box",
                                padding: "11px 14px", borderRadius: 10,
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-default)",
                                color: "var(--text-primary)", fontSize: "0.9rem",
                                outline: "none", resize: "vertical",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                                fontFamily: "inherit",
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = "#6366f1";
                                e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = "var(--border-default)";
                                e.target.style.boxShadow = "none";
                            }}
                        />
                    </div>

                    {/* Error */}
                    {submitError && (
                        <div style={{
                            marginBottom: 16,
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#f87171",
                            fontSize: "0.875rem",
                        }}>
                            ⚠️ {submitError}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                            style={{
                                flex: 1, padding: "12px 20px",
                                fontSize: "0.9rem", fontWeight: 600,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <span style={{
                                        width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                                        borderTopColor: "#fff", borderRadius: "50%",
                                        display: "inline-block", animation: "spin 0.7s linear infinite",
                                    }} />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                        <polyline points="17 21 17 13 7 13 7 21" />
                                        <polyline points="7 3 7 8 15 8" />
                                    </svg>
                                    Save Changes
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.back()}
                            style={{
                                padding: "12px 20px", borderRadius: 10,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid var(--border-default)",
                                color: "var(--text-secondary)",
                                fontSize: "0.9rem", fontWeight: 600,
                                cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                e.currentTarget.style.color = "var(--text-primary)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                e.currentTarget.style.color = "var(--text-secondary)";
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
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
