"use client";

import Link from "next/link";
import ExpenseListClient from "@/components/ExpenseListClient";

export default function ExpensesPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Expenses
        </h1>
        <Link href="/add" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium">
          + Add Expense
        </Link>
      </div>

      <ExpenseListClient />
    </main>
  );
}
