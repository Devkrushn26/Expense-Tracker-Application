import type { Expense, MonthlyBudget } from "@/types/expense";

// ---------------------------------------------------------------------------
// Shared in-memory data store
// We attach to `globalThis` so the same arrays survive hot-reloads in dev
// and are shared across all API route modules within the same server process.
// ---------------------------------------------------------------------------

declare global {
    // eslint-disable-next-line no-var
    var __expenses: Expense[] | undefined;
    // eslint-disable-next-line no-var
    var __budgets: MonthlyBudget[] | undefined;
}

export function getExpenses(): Expense[] {
    if (!globalThis.__expenses) {
        globalThis.__expenses = [];
    }
    return globalThis.__expenses;
}

export function getBudgets(): MonthlyBudget[] {
    if (!globalThis.__budgets) {
        globalThis.__budgets = [];
    }
    return globalThis.__budgets;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_REGEX = /^\d{4}-\d{2}$/;

/** Returns `true` if the string is a valid YYYY-MM-DD date */
export function isValidDate(value: string): boolean {
    if (!DATE_REGEX.test(value)) return false;
    const d = new Date(value);
    return !isNaN(d.getTime());
}

/** Returns `true` if the string matches YYYY-MM */
export function isValidMonth(value: string): boolean {
    return MONTH_REGEX.test(value);
}
