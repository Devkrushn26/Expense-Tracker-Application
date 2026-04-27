import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Expense, ExpenseFilters } from "@/types/expense";



interface ExpenseState {
    expenses: Expense[];
    filters: ExpenseFilters;
    selectedExpense: Expense | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

interface FetchExpensesArgs extends Partial<ExpenseFilters> {
    page?: number;
    pageSize?: number;
}

interface FetchExpensesResult {
    items: Expense[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

const defaultFilters: ExpenseFilters = {
    category: "all",
    month: "",
    search: "",
    minAmount: null,
    maxAmount: null,
};

const initialState: ExpenseState = {
    expenses: [],
    filters: { ...defaultFilters },
    selectedExpense: null,
    status: "idle",
    error: null,
};


// Async Thunks

/** GET /api/expenses → dispatches setExpenses */
export const fetchExpenses = createAsyncThunk(
    "expenses/fetchExpenses",
    async (filters: FetchExpensesArgs | undefined, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (filters?.page) {
                params.set("page", String(filters.page));
            }
            if (filters?.pageSize) {
                params.set("pageSize", String(filters.pageSize));
            }
            if (filters?.category && filters.category !== "all") {
                params.set("category", filters.category);
            }
            if (filters?.month) {
                params.set("month", filters.month);
            }
            if (filters?.search) {
                params.set("search", filters.search);
            }
            if (filters?.minAmount !== null && filters?.minAmount !== undefined) {
                params.set("minAmount", String(filters.minAmount));
            }
            if (filters?.maxAmount !== null && filters?.maxAmount !== undefined) {
                params.set("maxAmount", String(filters.maxAmount));
            }

            const qs = params.toString();
            const res = await fetch(`/api/expenses${qs ? `?${qs}` : ""}`);
            if (!res.ok) throw new Error("Failed to fetch expenses");
            const data = await res.json();

            if (Array.isArray(data)) {
                return {
                    items: data as Expense[],
                    total: data.length,
                    page: 1,
                    pageSize: data.length,
                    totalPages: 1,
                } satisfies FetchExpensesResult;
            }

            return data as FetchExpensesResult;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

export const fetchExpenseById = createAsyncThunk(
    "expenses/fetchExpenseById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/expenses/${id}`);
            if (!res.ok) throw new Error(res.status === 404 ? "Expense not found" : "Failed to fetch expense");
            return (await res.json()) as Expense;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);



/** POST /api/expenses → dispatches addExpense */
export const createExpense = createAsyncThunk(
    "expenses/createExpense",
    async (
        data: { title: string; amount: number; category: string; date: string; note?: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.errors?.join(", ") || "Failed to create expense");
            }
            return (await res.json()) as Expense;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

/** PUT /api/expenses/[id] → dispatches updateExpense */
export const editExpense = createAsyncThunk(
    "expenses/editExpense",
    async (
        { id, ...data }: Partial<Expense> & { id: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update expense");
            return (await res.json()) as Expense;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

/** DELETE /api/expenses/[id] → dispatches removeExpense */
export const deleteExpense = createAsyncThunk(
    "expenses/deleteExpense",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete expense");
            return id; // return the id so the reducer can remove it
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const expenseSlice = createSlice({
    name: "expenses",
    initialState,
    reducers: {
        setExpenses(state, action: PayloadAction<Expense[]>) {
            state.expenses = action.payload;
        },
        addExpense(state, action: PayloadAction<Expense>) {
            state.expenses.unshift(action.payload);
        },
        updateExpense(state, action: PayloadAction<Expense>) {
            const idx = state.expenses.findIndex((e) => e.id === action.payload.id);
            if (idx !== -1) {
                state.expenses[idx] = action.payload;
            }
        },
        removeExpense(state, action: PayloadAction<string>) {
            state.expenses = state.expenses.filter((e) => e.id !== action.payload);
        },
        setFilters(state, action: PayloadAction<Partial<ExpenseFilters>>) {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters(state) {
            state.filters = { ...defaultFilters };
        },
        setSelectedExpense(state, action: PayloadAction<Expense | null>) {
            state.selectedExpense = action.payload;
        },
    },
    extraReducers: (builder) => {
        // fetchExpenses
        builder
            .addCase(fetchExpenses.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.expenses = action.payload.items;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchExpenseById.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.selectedExpense = null;
            })
            .addCase(fetchExpenseById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.selectedExpense = action.payload;
            })
            .addCase(fetchExpenseById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
                state.selectedExpense = null;
            });

        // createExpense
        builder
            .addCase(createExpense.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(createExpense.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.expenses.unshift(action.payload);
            })
            .addCase(createExpense.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });

        // editExpense
        builder
            .addCase(editExpense.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(editExpense.fulfilled, (state, action) => {
                state.status = "succeeded";
                const idx = state.expenses.findIndex((e) => e.id === action.payload.id);
                if (idx !== -1) {
                    state.expenses[idx] = action.payload;
                }
            })
            .addCase(editExpense.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });

        // deleteExpense
        builder
            .addCase(deleteExpense.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.expenses = state.expenses.filter((e) => e.id !== action.payload);
            })
            .addCase(deleteExpense.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export const {
    setExpenses,
    addExpense,
    updateExpense,
    removeExpense,
    setFilters,
    clearFilters,
    setSelectedExpense,
} = expenseSlice.actions;

export default expenseSlice.reducer;
