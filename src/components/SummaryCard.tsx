interface SummaryCardProps {
    label: string;
    value: string;
    subLabel?: string;
    trend?: "up" | "down" | "neutral";
    gradient?: string;
    className?: string;
}

const TREND_CONFIG = {
    up: { arrow: "↑", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
    down: { arrow: "↓", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
    neutral: { arrow: "→", color: "#64748b", bg: "rgba(100, 116, 139, 0.1)" },
};

export default function SummaryCard({
    label,
    value,
    subLabel,
    trend,
    gradient,
    className = "",
}: SummaryCardProps) {
    return (
        <div
            className={`glass-card relative overflow-hidden p-5 ${className}`}
        >
            {/* Gradient accent bar at top */}
            <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: gradient || 'var(--gradient-brand)' }}
            />

            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {label}
            </p>

            <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {value}
                </p>

                {trend && (
                    <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                        style={{
                            color: TREND_CONFIG[trend].color,
                            background: TREND_CONFIG[trend].bg,
                        }}
                    >
                        {TREND_CONFIG[trend].arrow}
                    </span>
                )}
            </div>

            {subLabel && (
                <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {subLabel}
                </p>
            )}
        </div>
    );
}
