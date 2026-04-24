"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { ExpenseCategory } from "@/types/expense";

const categories: ExpenseCategory[] = [
    "food",
    "transport",
    "housing",
    "health",
    "entertainment",
    "education",
    "shopping",
    "other",
];

export default function EditExpensePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>("food");
    const [date, setDate] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    amount: Math.round(parseFloat(amount) * 100),
                    category,
                    date,
                    note,
                }),
            });

            if (res.ok) {
                router.push(`/expenses/${id}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="max-w-xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Edit Expense</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Amount ($)</label>
                    <input
                        type="number"
                        required
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Note (optional)
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </main>
    );
}
