"use client";

import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from "recharts";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { useCurrency } from "@/context/CurrencyContext";

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    food: "#f97316",
    transport: "#3b82f6",
    housing: "#a855f7",
    health: "#ef4444",
    entertainment: "#ec4899",
    education: "#6366f1",
    shopping: "#eab308",
    other: "#64748b",
};

const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
    food: "🍔",
    transport: "🚗",
    housing: "🏠",
    health: "💊",
    entertainment: "🎬",
    education: "📚",
    shopping: "🛍️",
    other: "📌",
};

interface DashboardChartsProps {
    expenses: Expense[];
    month: string;
}

// Custom dark tooltip
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-lg)',
        }}>
            {label && <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>{label}</p>}
            {payload.map((item: { name: string; value: number; color: string }, i: number) => (
                <p key={i} style={{ color: item.color || 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
                    {item.name}: {formatter ? formatter(item.value) : item.value}
                </p>
            ))}
        </div>
    );
};

export default function DashboardCharts({ expenses, month }: DashboardChartsProps) {
    const { formatAmount } = useCurrency();

    const monthExpenses = expenses.filter((e) => e.date.startsWith(month));

    // Pie data
    const categoryMap: Partial<Record<ExpenseCategory, number>> = {};
    for (const e of monthExpenses) {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    }

    const pieData = Object.entries(categoryMap)
        .filter(([, v]) => v > 0)
        .map(([cat, value]) => ({
            name: `${CATEGORY_EMOJI[cat as ExpenseCategory]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
            value,
            category: cat as ExpenseCategory,
        }))
        .sort((a, b) => b.value - a.value);

    // Bar data
    const dailyMap: Record<string, number> = {};
    for (const e of monthExpenses) {
        dailyMap[e.date.slice(8, 10)] = (dailyMap[e.date.slice(8, 10)] || 0) + e.amount;
    }
    const year = parseInt(month.slice(0, 4));
    const mon = parseInt(month.slice(5, 7));
    const totalDays = new Date(year, mon, 0).getDate();
    const barData = Array.from({ length: totalDays }, (_, i) => {
        const day = String(i + 1).padStart(2, "0");
        return { day, amount: dailyMap[day] || 0 };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderPieLabel = (entry: any) => {
        const pct = ((entry.percent || 0) * 100).toFixed(0);
        return `${entry.name} ${pct}%`;
    };

    const emptyState = (
        <div className="flex items-center justify-center h-[280px] text-sm"
            style={{ color: 'var(--text-muted)' }}>
            No expenses this month
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie chart */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Spending by Category
                </h2>
                {pieData.length === 0 ? emptyState : (
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                                label={renderPieLabel}
                                labelLine={false}
                                stroke="none"
                            >
                                {pieData.map((entry) => (
                                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip formatter={formatAmount} />} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bar chart */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Daily Spending
                </h2>
                {monthExpenses.length === 0 ? emptyState : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                tickLine={false}
                                tickFormatter={(v) => formatAmount(v)}
                                width={70}
                            />
                            <Tooltip
                                content={<CustomTooltip label="Daily" formatter={formatAmount} />}
                                cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                            />
                            <Legend
                                wrapperStyle={{ color: 'var(--text-muted)', fontSize: '12px' }}
                            />
                            <Bar
                                dataKey="amount"
                                name="Spent"
                                fill="url(#barGradient)"
                                radius={[4, 4, 0, 0]}
                            />
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
