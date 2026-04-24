import Link from "next/link";
import type { Expense, MonthlyBudget } from "@/types/expense";
import DashboardSummary from "@/components/DashboardSummary";
import DashboardCharts from "@/components/DashboardCharts";
import RecentExpenses from "@/components/RecentExpenses";
import BudgetProgressBar from "@/components/BudgetProgressBar";
import DemoLogin from "@/components/DemoLogin";
import { getExpenses, getBudgets } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const expenses: Expense[] = getExpenses().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const allBudgets: MonthlyBudget[] = getBudgets();
  const budget: MonthlyBudget = allBudgets.find(
    (b) => b.month === currentMonth
  ) ?? { month: currentMonth, amount: 0 };

  const recentExpenses = expenses.slice(0, 5);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Overview for {currentMonth}
          </p>
        </div>
        <Link
          href="/add"
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
        >
          + Add Expense
        </Link>
      </div>

      {/* Demo Login Banner for Visitors */}
      <DemoLogin />

      {/* Summary Cards */}
      <section className="mb-8">
        <DashboardSummary expenses={expenses} budget={budget} month={currentMonth} />
      </section>

      {/* Budget Progress */}
      <section className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Budget Progress
        </h2>
        <BudgetProgressBar
          spent={expenses
            .filter((e) => e.date.startsWith(currentMonth))
            .reduce((sum, e) => sum + e.amount, 0)}
          budget={budget.amount}
          month={currentMonth}
        />
      </section>

      {/* Charts */}
      <section className="mb-8">
        <DashboardCharts expenses={expenses} month={currentMonth} />
      </section>

      {/* Recent Expenses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Expenses
          </h2>
          <Link href="/expenses" className="text-sm font-medium" style={{ color: '#818cf8' }}>
            View all →
          </Link>
        </div>
        <RecentExpenses expenses={recentExpenses} />
      </section>
    </main>
  );
}
