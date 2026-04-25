import { NextRequest, NextResponse } from "next/server";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

type ExpenseRow = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note: string | null;
  created_at: string;
};

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    category: row.category,
    date: row.date,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

function normalizeAmountWriteError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("integer") ||
    lower.includes("numeric field overflow") ||
    lower.includes("invalid input syntax")
  ) {
    return "Database amount column still uses the old cents schema. Run scripts/supabase_amounts_to_decimal_usd.sql in Supabase, then try again.";
  }
  return message;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const supabase = await getSupabaseServerClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await context.params).id;
  const result = await supabase
    .from("expenses")
    .select("id,user_id,title,amount,category,date,note,created_at")
    .eq("id", id)
    .single();

  if (result.error || !result.data) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  return NextResponse.json(toExpense(result.data as ExpenseRow));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const supabase = await getSupabaseServerClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await context.params).id;

  try {
    const body = await request.json();

    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = String(body.title).trim();
    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
      }
      patch.amount = amount;
    }
    if (body.category !== undefined) patch.category = body.category;
    if (body.date !== undefined) patch.date = body.date;
    if (body.note !== undefined) patch.note = body.note ? String(body.note).trim() : null;

    const result = await supabase
      .from("expenses")
      .update(patch)
      .eq("id", id)
      .select("id,user_id,title,amount,category,date,note,created_at")
      .single();

    if (result.error || !result.data) {
      const errorMessage = result.error?.message;
      if (errorMessage) {
        return NextResponse.json(
          { error: normalizeAmountWriteError(errorMessage) },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(toExpense(result.data as ExpenseRow));
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const supabase = await getSupabaseServerClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await context.params).id;
  const result = await supabase.from("expenses").delete().eq("id", id);

  if (result.error) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Expense deleted" });
}
