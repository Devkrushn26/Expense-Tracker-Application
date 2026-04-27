"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { Expense, ExpenseCategory, MonthlyBudget } from "@/types/expense";
import { useCurrency } from "@/context/CurrencyContext";
import DashboardSummary from "@/components/DashboardSummary";
import { useExpenseSummary } from "@/hooks/useExpenseSummary";
import { useAppDispatch } from "@/hooks/useRedux";
import { fetchExpenses } from "@/store/expenseSlice";
import { fetchBudgets } from "@/store/budgetSlice";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f97316",
  transport: "#3b82f6",
  housing: "#a855f7",
  health: "#ef4444",
  entertainment: "#ec4899",
  education: "#6366f1",
  shopping: "#eab308",
  other: "#64748b",
};
const CATEGORY_EMOJI: Record<string, string> = {
  food: "🍔",
  transport: "🚗",
  housing: "🏠",
  health: "💊",
  entertainment: "🎬",
  education: "📚",
  shopping: "🛍️",
  other: "📌",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALL_CATEGORIES: ExpenseCategory[] = [
  "food",
  "transport",
  "housing",
  "health",
  "entertainment",
  "education",
  "shopping",
  "other",
];

function getLast12Months(anchorMonth: string): string[] {
  const months: string[] = [];
  const [anchorYear, anchorMonthNumber] = anchorMonth.split("-").map(Number);
  const d = new Date(anchorYear, anchorMonthNumber - 1, 1);
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push(
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return months;
}

function getLatestMonth(months: string[], fallbackMonth: string) {
  return months.reduce((latest, month) => {
    return month > latest ? month : latest;
  }, fallbackMonth);
}

function shortMonth(ym: string) {
  const [y, m] = ym.split("-");
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short" });
}

function fullMonth(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function categoryLabel(category: ExpenseCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DarkTooltip = ({ active, payload, label, fmt }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "var(--shadow-lg)",
        fontSize: 13,
      }}
    >
      {label && (
        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: 4,
            fontSize: 11,
          }}
        >
          {label}
        </p>
      )}
      {payload.map(
        (p: { name: string; value: number; color: string }, i: number) => (
          <p
            key={i}
            style={{
              color: p.color || "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            {p.name}: {fmt ? fmt(p.value) : p.value}
          </p>
        ),
      )}
    </div>
  );
};

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  icon,
  label,
  value,
  sub,
  gradient,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  gradient: string;
}) {
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16,
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          flexShrink: 0,
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "1.2rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginTop: 2,
          }}
        >
          {value}
        </p>
        {sub && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { formatAmount } = useCurrency();
  const dispatch = useAppDispatch();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [loading, setLoading] = useState(true);

  // The month the user is inspecting in the detail charts
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedCategory, setSelectedCategory] = useState<
    ExpenseCategory | "all"
  >("all");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [expenseResult, budgetResult] = await Promise.all([
        dispatch(fetchExpenses(undefined)).unwrap(),
        dispatch(fetchBudgets()).unwrap(),
      ]);

      setExpenses(expenseResult.items);
      setBudgets(budgetResult);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const chartAnchorMonth = getLatestMonth(
    [
      ...expenses.map((expense) => expense.date.slice(0, 7)),
      ...budgets.map((budget) => budget.month),
    ],
    currentMonth,
  );
  const last12 = getLast12Months(chartAnchorMonth);
  const currentYear = new Date().getFullYear().toString();

  // ── Year-to-date stats ────────────────────────────────────────────────────
  const ytdExpenses = expenses.filter((e) => e.date.startsWith(currentYear));
  const ytdTotal = ytdExpenses.reduce((s, e) => s + e.amount, 0);
  const ytdCount = ytdExpenses.length;
  const ytdMonthsWithSpending = new Set(
    ytdExpenses.map((e) => e.date.slice(0, 7)),
  ).size;
  const ytdAvgMonth =
    ytdMonthsWithSpending > 0
      ? Math.round(ytdTotal / ytdMonthsWithSpending)
      : 0;
  const ytdBudgetTotal = budgets
    .filter((b) => b.month.startsWith(currentYear))
    .reduce((s, b) => s + b.amount, 0);

  // ── Monthly bar data (last 12 months) ────────────────────────────────────
  const monthlyBarData = last12.map((m) => {
    const spent = expenses
      .filter((e) => e.date.startsWith(m))
      .reduce((s, e) => s + e.amount, 0);
    const budget = budgets.find((b) => b.month === m)?.amount ?? 0;
    return { month: shortMonth(m), ym: m, spent, budget };
  });

  // ── Selected-month detail ─────────────────────────────────────────────────
  const selExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const {
    totalSpent: selTotal,
    totalBudget: selBudget,
    remaining: selRemaining,
    byCategory,
  } = useExpenseSummary(selectedMonth);
  const transactionCount = selExpenses.length;
  const lineChartExpenses =
    selectedCategory === "all"
      ? selExpenses
      : selExpenses.filter((e) => e.category === selectedCategory);

  // Category pie
  const pieData = Object.entries(byCategory)
    .filter(([, value]) => value > 0)
    .map(([cat, value]) => ({
      name: `${CATEGORY_EMOJI[cat] || "📌"} ${cat}`,
      cat,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  // Daily spending line for selected month
  const [y, mo] = selectedMonth.split("-");
  const daysInMonth = new Date(parseInt(y), parseInt(mo), 0).getDate();
  const dailyMap: Record<string, number> = {};
  for (const e of lineChartExpenses) {
    const day = e.date.slice(8, 10);
    dailyMap[day] = (dailyMap[day] || 0) + e.amount;
  }
  const dailyLineData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    return { day: String(i + 1), amount: dailyMap[day] || 0 };
  });

  // Top categories for the selected month
  const topCats = [...pieData].slice(0, 5);

  if (loading) {
    return (
      <main
        style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 88, borderRadius: 16 }}
            />
          ))}
        </div>
        {[1, 2].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 300, borderRadius: 16, marginBottom: 16 }}
          />
        ))}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.875rem",
              marginTop: 4,
            }}
          >
            Analytics for {currentYear} · {ytdCount} expenses recorded
          </p>
        </div>
        <Link
          href="/add"
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + Add Expense
        </Link>
      </div>

      {/* ── YTD stat tiles ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 14,
          marginBottom: "2rem",
        }}
      >
        <StatTile
          icon="💸"
          label="YTD Total Spent"
          value={formatAmount(ytdTotal)}
          sub={`${currentYear}`}
          gradient="linear-gradient(135deg,#ef4444,#f87171)"
        />
        <StatTile
          icon="📅"
          label="Avg / Month"
          value={formatAmount(ytdAvgMonth)}
          sub={`${ytdMonthsWithSpending} active months`}
          gradient="linear-gradient(135deg,#a855f7,#c084fc)"
        />
        <StatTile
          icon="🧾"
          label="Transactions"
          value={String(ytdCount)}
          sub={`YTD ${currentYear}`}
          gradient="linear-gradient(135deg,#3b82f6,#60a5fa)"
        />
        <StatTile
          icon="🎯"
          label="Total Budget"
          value={ytdBudgetTotal > 0 ? formatAmount(ytdBudgetTotal) : "Not set"}
          sub={
            ytdBudgetTotal > 0 ? `${currentYear} budgets` : "Go to Budget page"
          }
          gradient="linear-gradient(135deg,#10b981,#34d399)"
        />
      </div>

      {/* ── 12-month bar chart ── */}
      <div
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--glass-border)",
          borderRadius: 20,
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "1rem",
          }}
        >
          📊 Monthly Spending — Last 12 Months
        </h2>
        {ytdTotal === 0 && expenses.length === 0 ? (
          <div
            style={{
              height: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            No expense data yet.{" "}
            <Link href="/add" style={{ color: "#818cf8", marginLeft: 6 }}>
              Add your first expense →
            </Link>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={monthlyBarData}
              barGap={4}
              onClick={(d) => {
                const payload = (
                  d as { activePayload?: Array<{ payload?: { ym?: string } }> }
                )?.activePayload;
                const ym = payload?.[0]?.payload?.ym;
                if (ym) setSelectedMonth(ym);
              }}
            >
              <defs>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatAmount(v)}
                width={72}
              />
              <Tooltip
                content={<DarkTooltip fmt={formatAmount} />}
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
              />
              <Legend
                wrapperStyle={{
                  color: "var(--text-muted)",
                  fontSize: 12,
                  paddingTop: 8,
                }}
              />
              <Bar
                dataKey="spent"
                name="Spent"
                fill="url(#spentGrad)"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="budget"
                name="Budget"
                fill="url(#budgetGrad)"
                radius={[5, 5, 0, 0]}
                opacity={0.5}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: 8,
          }}
        >
          💡 Click any bar to see that month&apos;s detailed breakdown below
        </p>
      </div>

      {/* ── Month selector + detail section ── */}
      <div
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--glass-border)",
          borderRadius: 20,
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Month picker header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            🔍 Detail View — {fullMonth(selectedMonth)}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Select month:
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                colorScheme: "dark",
                fontSize: "0.875rem",
                padding: "6px 10px",
                borderRadius: 8,
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <DashboardSummary month={selectedMonth} />
        </div>

        {transactionCount === 0 ? (
          <div
            style={{
              height: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 36 }}>📭</span>
            <p>No expenses for {fullMonth(selectedMonth)}</p>
          </div>
        ) : (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            {/* Daily line chart */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  Daily Spending
                </h3>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {transactionCount} transaction
                  {transactionCount === 1 ? "" : "s"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label
                    htmlFor="monthly-category-filter"
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Category:
                  </label>
                  <select
                    id="monthly-category-filter"
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as ExpenseCategory | "all")
                    }
                    style={{
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: "0.875rem",
                    }}
                  >
                    <option value="all">All categories</option>
                    {ALL_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyLineData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatAmount(v)}
                    width={64}
                  />
                  <Tooltip
                    content={<DarkTooltip fmt={formatAmount} />}
                    cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name={
                      selectedCategory === "all"
                        ? "Spent"
                        : `${categoryLabel(selectedCategory)} spending`
                    }
                    stroke="url(#lineGrad)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#818cf8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category pie + legend */}
            <div>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 6,
                }}
              >
                By Category
              </h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginBottom: 12,
                }}
              >
                Budget:{" "}
                {selBudget > 0 ? formatAmount(selBudget) : "Not set"} ·{" "}
                {selBudget > 0
                  ? selRemaining < 0
                    ? `Over by ${formatAmount(Math.abs(selRemaining))}`
                    : `Remaining ${formatAmount(selRemaining)}`
                  : `Spent ${formatAmount(selTotal)}`}
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.cat}
                          fill={CATEGORY_COLORS[entry.cat] || "#64748b"}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip fmt={formatAmount} />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom legend */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {topCats.map((c) => {
                    const pct =
                      selTotal > 0
                        ? ((c.value / selTotal) * 100).toFixed(0)
                        : "0";
                    return (
                      <div
                        key={c.cat}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            background: CATEGORY_COLORS[c.cat] || "#64748b",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            flex: 1,
                            textTransform: "capitalize",
                          }}
                        >
                          {c.cat}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            fontWeight: 600,
                          }}
                        >
                          {formatAmount(c.value)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontWeight: 600,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent expenses ── */}
      <div
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--glass-border)",
          borderRadius: 20,
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            🕒 Recent Expenses
          </h2>
          <Link
            href="/expenses"
            style={{
              fontSize: "0.8rem",
              color: "#818cf8",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View all →
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {expenses.slice(0, 6).map((e) => (
            <Link
              key={e.id}
              href={`/expenses/${e.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(el) =>
                (el.currentTarget.style.background = "var(--bg-card-hover)")
              }
              onMouseLeave={(el) =>
                (el.currentTarget.style.background = "var(--bg-card)")
              }
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>
                {CATEGORY_EMOJI[e.category] || "📌"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.title}
                </p>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    margin: 0,
                  }}
                >
                  {e.date}
                </p>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  flexShrink: 0,
                  color: "var(--text-primary)",
                }}
              >
                {formatAmount(e.amount)}
              </span>
            </Link>
          ))}
          {expenses.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--text-muted)",
              }}
            >
              No expenses yet.{" "}
              <Link href="/add" style={{ color: "#818cf8" }}>
                Add one →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
