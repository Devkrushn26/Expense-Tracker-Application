import { NextRequest, NextResponse } from "next/server";
import type { MonthlyBudget } from "@/types/expense";
import { getBudgets, isValidMonth } from "@/lib/data";

// GET /api/budget

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { month, amount } = body;

       
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

// DELETE /api/budget?month=YYYY-MM

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    if (!month || !isValidMonth(month)) {
        return NextResponse.json({ error: "month query param must be YYYY-MM" }, { status: 400 });
    }

    const budgets = getBudgets();
    const idx = budgets.findIndex((b) => b.month === month);

    if (idx === -1) {
        return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    budgets.splice(idx, 1);
    return NextResponse.json({ message: "Budget deleted" });
}

