import type { ExpenseCategory } from "@/types/expense";

// ---------------------------------------------------------------------------
// Category config (emoji + dark theme colors)
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Record<
    ExpenseCategory,
    { emoji: string; bg: string; text: string; border: string; glow: string }
> = {
    food: {
        emoji: "🍔",
        bg: "rgba(249, 115, 22, 0.12)",
        text: "#fb923c",
        border: "#f97316",
        glow: "rgba(249, 115, 22, 0.2)",
    },
    transport: {
        emoji: "🚗",
        bg: "rgba(59, 130, 246, 0.12)",
        text: "#60a5fa",
        border: "#3b82f6",
        glow: "rgba(59, 130, 246, 0.2)",
    },
    housing: {
        emoji: "🏠",
        bg: "rgba(168, 85, 247, 0.12)",
        text: "#c084fc",
        border: "#a855f7",
        glow: "rgba(168, 85, 247, 0.2)",
    },
    health: {
        emoji: "💊",
        bg: "rgba(239, 68, 68, 0.12)",
        text: "#f87171",
        border: "#ef4444",
        glow: "rgba(239, 68, 68, 0.2)",
    },
    entertainment: {
        emoji: "🎬",
        bg: "rgba(236, 72, 153, 0.12)",
        text: "#f472b6",
        border: "#ec4899",
        glow: "rgba(236, 72, 153, 0.2)",
    },
    education: {
        emoji: "📚",
        bg: "rgba(99, 102, 241, 0.12)",
        text: "#818cf8",
        border: "#6366f1",
        glow: "rgba(99, 102, 241, 0.2)",
    },
    shopping: {
        emoji: "🛍️",
        bg: "rgba(234, 179, 8, 0.12)",
        text: "#fbbf24",
        border: "#eab308",
        glow: "rgba(234, 179, 8, 0.2)",
    },
    other: {
        emoji: "📌",
        bg: "rgba(100, 116, 139, 0.12)",
        text: "#94a3b8",
        border: "#64748b",
        glow: "rgba(100, 116, 139, 0.2)",
    },
};

/** Re-export for use by other components */
export { CATEGORY_CONFIG };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CategoryBadgeProps {
    category: ExpenseCategory;
    size?: "sm" | "md";
    className?: string;
}

export default function CategoryBadge({
    category,
    size = "md",
    className = "",
}: CategoryBadgeProps) {
    const config = CATEGORY_CONFIG[category];
    const sizeClasses =
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${className}`}
            style={{
                background: config.bg,
                color: config.text,
                border: `1px solid ${config.bg}`,
            }}
        >
            <span>{config.emoji}</span>
            <span className="capitalize">{category}</span>
        </span>
    );
}
