import { NextRequest, NextResponse } from "next/server";
import type { MonthlyBudget } from "@/types/expense";
import { getBudgets, isValidMonth } from "@/lib/data";

// GET /api/budget
// Returns the MonthlyBudget for ?month=YYYY-MM.
// Returns { amount: 0 } if no budget is set for that month.
// Without ?month, returns all budgets.
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (month) {
        const budget = getBudgets().find((b) => b.month === month);
        return NextResponse.json(budget || { month, amount: 0 });
    }

    return NextResponse.json(getBudgets());
}

// POST /api/budget
// Accepts { month: string, amount: number }.
// Creates or replaces the budget for that month.
// Returns the updated MonthlyBudget.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { month, amount } = body;

        // --- Validation ---
        const errors: string[] = [];

        if (!month || typeof month !== "string" || !isValidMonth(month)) {
            errors.push("month must be a valid YYYY-MM string");
        }

        if (amount == null || typeof amount !== "number" || amount < 0) {
            errors.push("amount must be a non-negative number (cents)");
        }

        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        // --- Upsert budget ---
        const budgets = getBudgets();
        const existing = budgets.findIndex((b) => b.month === month);

        if (existing >= 0) {
            budgets[existing].amount = Number(amount);
            return NextResponse.json(budgets[existing]);
        }

        const newBudget: MonthlyBudget = {
            month,
            amount: Number(amount),
        };

        budgets.push(newBudget);
        return NextResponse.json(newBudget, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}
