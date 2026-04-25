import { NextRequest, NextResponse } from "next/server";
import type { MonthlyBudget } from "@/types/expense";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const MONTH_REGEX = /^\d{4}-\d{2}$/;

type BudgetRow = {
  id: string;
  user_id: string;
  month: string;
  amount: number;
  created_at: string;
};

function toBudget(row: BudgetRow): MonthlyBudget {
  return {
    month: row.month,
    amount: row.amount,
  };
}

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const month = new URL(request.url).searchParams.get("month");

  if (month) {
    const one = await supabase
      .from("budgets")
      .select("id,user_id,month,amount,created_at")
      .eq("month", month)
      .maybeSingle();

    if (one.error) return NextResponse.json({ error: one.error.message }, { status: 500 });
    if (!one.data) return NextResponse.json({ month: month, amount: 0 });
    return NextResponse.json(toBudget(one.data as BudgetRow));
  }

  const all = await supabase
    .from("budgets")
    .select("id,user_id,month,amount,created_at")
    .order("month", { ascending: false });

  if (all.error) return NextResponse.json({ error: all.error.message }, { status: 500 });
  return NextResponse.json((all.data ?? []).map(toBudget));
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const month = body.month;
    const amount = body.amount;

    const errors: string[] = [];
    if (!month || typeof month !== "string" || !MONTH_REGEX.test(month)) {
      errors.push("month must be YYYY-MM");
    }
    if (amount == null || typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
      errors.push("amount must be a non-negative number");
    }
    if (errors.length > 0) return NextResponse.json({ errors: errors }, { status: 400 });

    const upsertResult = await supabase
      .from("budgets")
      .upsert(
        { user_id: user.id, month: month, amount: Number(amount) },
        { onConflict: "user_id,month" }
      )
      .select("id,user_id,month,amount,created_at")
      .single();

    if (upsertResult.error) {
      return NextResponse.json({ error: upsertResult.error.message }, { status: 500 });
    }

    return NextResponse.json(toBudget(upsertResult.data as BudgetRow));
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const month = new URL(request.url).searchParams.get("month");
  if (!month || !MONTH_REGEX.test(month)) {
    return NextResponse.json({ error: "month query param must be YYYY-MM" }, { status: 400 });
  }

  const result = await supabase.from("budgets").delete().eq("month", month);
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

  return NextResponse.json({ message: "Budget deleted" });
}
