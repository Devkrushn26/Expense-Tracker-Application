import { NextRequest, NextResponse } from "next/server";
import type { Expense } from "@/types/expense";
import { getExpenses, isValidDate } from "@/lib/data";

// GET /api/expenses


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const month = searchParams.get("month");
    const search = searchParams.get("search");

    let filtered = [...getExpenses()];

    if (category && category !== "all") {
        filtered = filtered.filter((e) => e.category === category);
    }

    if (month) {
        filtered = filtered.filter((e) => e.date.startsWith(month));
    }

    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
            (e) =>
                e.title.toLowerCase().includes(q) ||
                (e.note && e.note.toLowerCase().includes(q))
        );
    }


    filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(filtered);
}

// POST /api/expenses


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, amount, category, date, note } = body;

     
        const errors: string[] = [];

        if (!title || typeof title !== "string" || title.trim().length === 0) {
            errors.push("title must be a non-empty string");
        }

        if (amount == null || !Number.isInteger(amount) || amount <= 0) {
            errors.push("amount must be a positive integer (cents)");
        }

        if (!category) {
            errors.push("category is required");
        }

        if (!date || typeof date !== "string" || !isValidDate(date)) {
            errors.push("date must be a valid YYYY-MM-DD string");
        }

        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        const newExpense: Expense = {
            id: crypto.randomUUID(),
            title: title.trim(),
            amount: Number(amount),
            category,
            date,
            note: note ? String(note).trim() : undefined,
            createdAt: new Date().toISOString(),
        };

        getExpenses().push(newExpense);

        return NextResponse.json(newExpense, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}
