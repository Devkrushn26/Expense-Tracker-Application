"use client";

import { useCurrency } from "@/context/CurrencyContext";

interface BudgetProgressBarProps {
    spent: number;
    budget: number;
    month: string;
    className?: string;
}

export default function BudgetProgressBar({
    spent,
    budget,
    month,
    className = "",
}: BudgetProgressBarProps) {
    const { formatAmount } = useCurrency();

    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const overBudget = budget > 0 && spent > budget;

    // Color thresholds
    let barGradient = "linear-gradient(90deg, #10b981, #34d399)";
    let glowColor = "rgba(16, 185, 129, 0.3)";
    if (percentage >= 90 || overBudget) {
        barGradient = "linear-gradient(90deg, #ef4444, #f87171)";
        glowColor = "rgba(239, 68, 68, 0.3)";
    } else if (percentage >= 70) {
        barGradient = "linear-gradient(90deg, #f59e0b, #fbbf24)";
        glowColor = "rgba(245, 158, 11, 0.3)";
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {month}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                    {formatAmount(spent)} / {formatAmount(budget)}
                </span>
            </div>

            <div
                className="h-3 w-full rounded-full overflow-hidden"
                style={{ background: 'var(--bg-card)' }}
            >
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${percentage}%`,
                        background: barGradient,
                        boxShadow: `0 0 12px ${glowColor}`,
                    }}
                />
            </div>

            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{percentage.toFixed(0)}% used</span>
                {overBudget ? (
                    <span className="font-medium" style={{ color: '#f87171' }}>
                        Over by {formatAmount(spent - budget)}
                    </span>
                ) : (
                    <span>{formatAmount(budget - spent)} remaining</span>
                )}
            </div>
        </div>
    );
}
