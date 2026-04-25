export type ExpenseCategory =
    | "food"
    | "transport"
    | "housing"
    | "health"
    | "entertainment"
    | "education"
    | "shopping"
    | "other";

export interface Expense {
    id: string;
    title: string;
    amount: number; // stored as USD amount
    category: ExpenseCategory;
    date: string; // ISO date string YYYY-MM-DD
    note?: string;
    createdAt: string;
}

export interface MonthlyBudget {
    month: string; // "YYYY-MM"
    amount: number; // stored as USD amount
}

export interface ExpenseFilters {
    category: ExpenseCategory | "all";
    month: string; // "YYYY-MM" or "" for all
    search: string;
    minAmount: number | null;
    maxAmount: number | null;
}

export interface ExpenseSummary {
    totalSpent: number;
    totalBudget: number;
    remaining: number;
    byCategory: Record<ExpenseCategory, number>;
}
