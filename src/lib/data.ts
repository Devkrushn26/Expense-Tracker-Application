import type { Expense, MonthlyBudget } from "@/types/expense";



declare global {

    var __expenses: Expense[] | undefined;
  
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



const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_REGEX = /^\d{4}-\d{2}$/;


export function isValidDate(value: string): boolean {
    if (!DATE_REGEX.test(value)) return false;
    const d = new Date(value);
    return !isNaN(d.getTime());
}

export function isValidMonth(value: string): boolean {
    return MONTH_REGEX.test(value);
}
