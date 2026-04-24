import Link from "next/link";

interface ExpenseDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ExpenseDetailPage({
    params,
}: ExpenseDetailPageProps) {
    const { id } = await params;

    return (
        <main className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    href="/expenses"
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← Back to Expenses
                </Link>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Expense Detail</h1>
                    <Link
                        href={`/expenses/${id}/edit`}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        Edit
                    </Link>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm text-gray-500">Title</dt>
                        <dd className="text-lg font-medium">—</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Amount</dt>
                        <dd className="text-lg font-medium">$0.00</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Category</dt>
                        <dd className="text-lg font-medium capitalize">—</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Date</dt>
                        <dd className="text-lg font-medium">—</dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-sm text-gray-500">Note</dt>
                        <dd className="text-lg font-medium">—</dd>
                    </div>
                </dl>
            </div>
        </main>
    );
}
