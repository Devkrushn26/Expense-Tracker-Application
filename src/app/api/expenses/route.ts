import { NextRequest, NextResponse } from "next/server";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const VALID_CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "housing",
  "health",
  "entertainment",
  "education",
  "shopping",
  "other",
];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_REGEX = /^\d{4}-\d{2}$/;

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

function getNextMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonthDate = new Date(Date.UTC(year, monthNumber, 1));
  const nextYear = nextMonthDate.getUTCFullYear();
  const nextMonth = String(nextMonthDate.getUTCMonth() + 1).padStart(2, "0");

  return `${nextYear}-${nextMonth}-01`;
}

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  const category = searchParams.get("category");
  const month = searchParams.get("month");
  const search = searchParams.get("search");
  const minAmount = searchParams.get("minAmount");
  const maxAmount = searchParams.get("maxAmount");
  const page = Number(searchParams.get("page") ?? "");
  const pageSize = Number(searchParams.get("pageSize") ?? "");
  const usePagination =
    Number.isInteger(page) && page > 0 && Number.isInteger(pageSize) && pageSize > 0;

  let query = supabase
    .from("expenses")
    .select("id,user_id,title,amount,category,date,note,created_at", usePagination ? { count: "exact" } : undefined)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (month && MONTH_REGEX.test(month)) {
    query = query.gte("date", month + "-01").lt("date", getNextMonth(month));
  }
  if (search) {
    query = query.or("title.ilike.%" + search + "%,note.ilike.%" + search + "%");
  }
  if (minAmount && Number.isFinite(Number(minAmount))) {
    query = query.gte("amount", Number(minAmount));
  }
  if (maxAmount && Number.isFinite(Number(maxAmount))) {
    query = query.lte("amount", Number(maxAmount));
  }
  if (usePagination) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const result = await query;
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  const items = (result.data ?? []).map(toExpense);
  if (!usePagination) {
    return NextResponse.json(items);
  }

  const total = result.count ?? 0;
  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const title = body.title;
    const amount = body.amount;
    const category = body.category;
    const date = body.date;
    const note = body.note;

    const errors: string[] = [];

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      errors.push("title must be a non-empty string");
    }
    if (amount == null || typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      errors.push("amount must be a positive number");
    }
    if (!VALID_CATEGORIES.includes(category as ExpenseCategory)) {
      errors.push("category is invalid");
    }
    if (!date || typeof date !== "string" || !DATE_REGEX.test(date)) {
      errors.push("date must be YYYY-MM-DD");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors: errors }, { status: 400 });
    }

    const insertResult = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        title: String(title).trim(),
        amount: Number(amount),
        category: category,
        date: date,
        note: note ? String(note).trim() : null,
      })
      .select("id,user_id,title,amount,category,date,note,created_at")
      .single();

    if (insertResult.error) {
      return NextResponse.json(
        { error: normalizeAmountWriteError(insertResult.error.message) },
        { status: 500 },
      );
    }

    return NextResponse.json(toExpense(insertResult.data as ExpenseRow), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
