export default function ExpensesLoading() {
    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div className="skeleton h-9 w-40" />
                <div className="skeleton h-10 w-32" />
            </div>

            {/* Filter bar skeleton */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="skeleton h-10 w-64" />
                <div className="skeleton h-10 w-36" />
                <div className="skeleton h-10 w-36" />
            </div>

            {/* Expense card skeletons */}
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="glass-card flex items-center gap-4 p-4"
                        style={{ borderLeft: '3px solid var(--border-default)' }}
                    >
                        <div className="skeleton h-11 w-11 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="skeleton h-4 w-32" />
                                <div className="skeleton h-5 w-20 rounded-full" />
                            </div>
                            <div className="skeleton h-3 w-24" />
                        </div>
                        <div className="skeleton h-6 w-20" />
                        <div className="skeleton h-8 w-8 rounded-lg" />
                    </div>
                ))}
            </div>
        </main>
    );
}
