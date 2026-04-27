"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { useAppDispatch } from "@/hooks/useRedux";
import { editExpense, fetchExpenseById } from "@/store/expenseSlice";
import type { Expense, ExpenseCategory } from "@/types/expense";

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

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label
            style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 8,
            }}
        >
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

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "#6366f1";
    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
}

function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "var(--border-default)";
    e.target.style.boxShadow = "none";
}

function EditExpenseForm({ id, initialExpense }: { id: string; initialExpense: Expense }) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currencySymbol, toUsdAmount, currency } = useCurrency();
    const { values, errors, handleChange, handleSubmit: submitForm, reset } = useExpenseForm(initialExpense);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError("");

        try {
            await submitForm(async (formData) => {
                await dispatch(editExpense({
                    id,
                    title: formData.title,
                    amount: toUsdAmount(formData.amount),
                    category: formData.category,
                    date: formData.date,
                    note: formData.note,
                })).unwrap();

                reset();
                router.push(`/expenses/${id}`);
            });
        } catch (err) {
            setSubmitError((err as Error).message || "Failed to save changes.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
            <Link
                href={`/expenses/${id}`}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    marginBottom: "1.75rem",
                }}
            >
                Back to Expense
            </Link>

            <div
                style={{
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 24,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        padding: "1.5rem 2rem",
                    }}
                >
                    <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Edit Expense
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                        Update the details below and save your changes
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "1.75rem 2rem" }}>
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
                        {errors.title ? <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 6 }}>{errors.title}</p> : null}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                        <div>
                            <FieldLabel>Amount ({currencySymbol} {currency})</FieldLabel>
                            <div style={{ position: "relative" }}>
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 12,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--text-muted)",
                                        fontWeight: 600,
                                        fontSize: "0.9rem",
                                        pointerEvents: "none",
                                    }}
                                >
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
                            {errors.amount ? <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 6 }}>{errors.amount}</p> : null}
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
                            {errors.date ? <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 6 }}>{errors.date}</p> : null}
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <FieldLabel>Category</FieldLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                            {CATEGORIES.map((category) => {
                                const selected = values.category === category;
                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => handleChange("category", category)}
                                        style={{
                                            padding: "10px 6px",
                                            borderRadius: 12,
                                            border: `1.5px solid ${selected ? "#818cf8" : "var(--border-subtle)"}`,
                                            background: selected ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                                            color: selected ? "#818cf8" : "var(--text-muted)",
                                            cursor: "pointer",
                                            fontSize: "0.75rem",
                                            fontWeight: selected ? 700 : 500,
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {category}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.category ? <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 6 }}>{errors.category}</p> : null}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <FieldLabel>Note <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span></FieldLabel>
                        <textarea
                            value={values.note}
                            onChange={(e) => handleChange("note", e.target.value)}
                            rows={3}
                            placeholder="Add a note about this expense..."
                            style={{ ...inputStyle, resize: "vertical" }}
                            onFocus={focusStyle}
                            onBlur={blurStyle}
                        />
                    </div>

                    {submitError ? (
                        <div
                            style={{
                                marginBottom: 16,
                                padding: "10px 14px",
                                borderRadius: 10,
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                color: "#f87171",
                                fontSize: "0.875rem",
                            }}
                        >
                            {submitError}
                        </div>
                    ) : null}

                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                            style={{
                                flex: 1,
                                padding: "12px 20px",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                            }}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                router.back();
                            }}
                            style={{
                                padding: "12px 20px",
                                borderRadius: 10,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid var(--border-default)",
                                color: "var(--text-secondary)",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default function EditExpensePage() {
    const params = useParams();
    const id = params?.id as string;
    const dispatch = useAppDispatch();
    const { fromUsdAmount } = useCurrency();
    const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
    const [initialExpense, setInitialExpense] = useState<Expense | null>(null);

    useEffect(() => {
        if (!id) return;

        dispatch(fetchExpenseById(id)).unwrap()
            .then((expense) => {
                setInitialExpense({
                    ...expense,
                    amount: fromUsdAmount(expense.amount),
                });
                setLoadStatus("ready");
            })
            .catch(() => setLoadStatus("error"));
    }, [dispatch, fromUsdAmount, id]);

    if (loadStatus === "loading") {
        return (
            <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
                <div className="skeleton" style={{ width: "100%", height: 360, borderRadius: 24 }} />
            </main>
        );
    }

    if (loadStatus === "error" || !initialExpense) {
        return (
            <main style={{ maxWidth: 480, margin: "6rem auto", padding: "2rem 1rem", textAlign: "center" }}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                    Expense Not Found
                </h1>
                <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                    Could not load the expense details.
                </p>
                <Link
                    href="/expenses"
                    style={{
                        display: "inline-flex",
                        background: "var(--gradient-brand)",
                        color: "#fff",
                        padding: "10px 24px",
                        borderRadius: 10,
                        fontWeight: 600,
                        textDecoration: "none",
                    }}
                >
                    Back to Expenses
                </Link>
            </main>
        );
    }

    return <EditExpenseForm id={id} initialExpense={initialExpense} />;
}
