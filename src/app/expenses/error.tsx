"use client";

export default function ExpensesError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="glass-card p-10 text-center" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <div className="text-5xl mb-4">😵</div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#f87171' }}>
                    Something went wrong
                </h2>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                    {error.message || "Failed to load expenses. Please try again."}
                </p>
                <button
                    onClick={reset}
                    className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #ef4444, #f87171)',
                        boxShadow: '0 2px 12px rgba(239, 68, 68, 0.3)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.5)')}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(239, 68, 68, 0.3)')}
                >
                    Try Again
                </button>
            </div>
        </main>
    );
}
