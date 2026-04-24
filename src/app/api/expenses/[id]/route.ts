import { NextRequest, NextResponse } from "next/server";
import { getExpenses } from "@/lib/data";

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/expenses/[id]

export async function GET(_request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    const expense = getExpenses().find((e) => e.id === id);

    if (!expense) {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
}

// PUT /api/expenses/[id]

export async function PUT(request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    const expenses = getExpenses();
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    try {
        const body = await request.json();
        const { title, amount, category, date, note } = body;

        expenses[index] = {
            ...expenses[index],
            ...(title !== undefined && { title: String(title).trim() }),
            ...(amount !== undefined && { amount: Number(amount) }),
            ...(category !== undefined && { category }),
            ...(date !== undefined && { date }),
            ...(note !== undefined && { note: note ? String(note).trim() : undefined }),
        };

        return NextResponse.json(expenses[index]);
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}

// DELETE /api/expenses/[id]

export async function DELETE(_request: NextRequest, context: RouteContext) {
    const { id } = await context.params;
    const expenses = getExpenses();
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
        return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    expenses.splice(index, 1);
    return NextResponse.json({ message: "Expense deleted" });
}
