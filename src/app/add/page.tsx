"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ExpenseCategory } from "@/types/expense";
import { useCurrency } from "@/context/CurrencyContext";
import { useExpenseForm } from "@/hooks/useExpenseForm";

// ─── Category Config ──────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    borderRadius: 10,
    background: "var(--bg-card)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddExpensePage() {
    const router = useRouter();
    const { currencySymbol, toUsdAmount, currency } = useCurrency();

    const { values, errors, handleChange, handleSubmit: submitForm } = useExpenseForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError("");

        try {
            await submitForm(async (formData) => {
                const usdAmount = toUsdAmount(formData.amount);

                const res = await fetch("/api/expenses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: formData.title,
                        amount: usdAmount,
                        category: formData.category,
                        date: formData.date,
                        note: formData.note,
                    }),
                });

                if (res.ok) {
                    router.push("/expenses");
                } else {
                    const body = await res.json();
                    setSubmitError(body.errors?.join(", ") || body.error || "Failed to add expense.");
                }
            });
        } catch {
            setSubmitError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const cat = CATEGORY_CONFIG[values.category];

    function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
        e.target.style.borderColor = "#6366f1";
        e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
    }
    function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
        e.target.style.borderColor = "var(--border-default)";
        e.target.style.boxShadow = "none";
    }

    return (
        <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>

            {/* Card */}
            <div style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `1px solid ${cat.border}40`,
                borderRadius: 24,
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
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
                            Add New Expense
                        </h1>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                            Amounts in <strong style={{ color: "var(--text-secondary)" }}>{currency}</strong> — converted &amp; stored as USD internally
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
                            value={values.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="What did you spend on?"
                            style={inputStyle}
                            onFocus={focusStyle}
                            onBlur={blurStyle}
                        />
                        {errors.title ? (
                            <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 6 }}>
                                {errors.title}
                            </p>
                        ) : null}
                    </div>

                    {/* Amount + Date */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                        <div>
                            <FieldLabel>Amount ({currencySymbol})</FieldLabel>
                            {/* Wrapper with currency prefix */}
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
                                    value={values.amount}
                                    onChange={(e) => handleChange("amount", e.target.value)}
                                    placeholder="0.00"
                                    style={{ ...inputStyle, paddingLeft: 28 }}
                                    onFocus={focusStyle}
                                    onBlur={blurStyle}
                                />
                            </div>
                            {errors.amount ? (
                                <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 6 }}>
                                    {errors.amount}
                                </p>
                            ) : null}
                        </div>
                        <div>
                            <FieldLabel>Date</FieldLabel>
                            <input
                                type="date"
                                required
                                value={values.date}
                                onChange={(e) => handleChange("date", e.target.value)}
                                style={{ ...inputStyle, colorScheme: "dark" }}
                                onFocus={focusStyle}
                                onBlur={blurStyle}
                            />
                            {errors.date ? (
                                <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 6 }}>
                                    {errors.date}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {/* Category picker */}
                    <div style={{ marginBottom: 20 }}>
                        <FieldLabel>Category</FieldLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                            {CATEGORIES.map((c) => {
                                const cfg = CATEGORY_CONFIG[c];
                                const selected = values.category === c;
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => handleChange("category", c)}
                                        style={{
                                            display: "flex", flexDirection: "column",
                                            alignItems: "center", gap: 4,
                                            padding: "10px 6px", borderRadius: 12,
                                            border: `1.5px solid ${selected ? cfg.border : "var(--border-subtle)"}`,
                                            background: selected ? cfg.bg : "rgba(255,255,255,0.02)",
                                            color: selected ? cfg.text : "var(--text-muted)",
                                            cursor: "pointer", transition: "all 0.15s ease",
                                            fontSize: "0.75rem", fontWeight: selected ? 700 : 500,
                                        }}
                                    >
                                        <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
                                        <span style={{ textTransform: "capitalize" }}>{cfg.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.category ? (
                            <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 6 }}>
                                {errors.category}
                            </p>
                        ) : null}
                    </div>

                    {/* Note */}
                    <div style={{ marginBottom: 24 }}>
                        <FieldLabel>Note <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
                        <textarea
                            value={values.note}
                            onChange={(e) => handleChange("note", e.target.value)}
                            rows={3}
                            placeholder="Add a note..."
                            style={{ ...inputStyle, resize: "vertical" }}
                            onFocus={focusStyle}
                            onBlur={blurStyle}
                        />
                    </div>

                    {/* Error */}
                    {submitError && (
                        <div style={{
                            marginBottom: 16, padding: "10px 14px", borderRadius: 10,
                            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                            color: "#f87171", fontSize: "0.875rem",
                        }}>
                            ⚠️ {submitError}
                        </div>
                    )}

                    {/* Buttons */}
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
                                    Adding…
                                </>
                            ) : (
                                <>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Add Expense
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
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
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
