import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Expense, ExpenseFilters } from "@/types/expense";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ExpenseState {
    expenses: Expense[];
    filters: ExpenseFilters;
    selectedExpense: Expense | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
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

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

/** GET /api/expenses → dispatches setExpenses */
export const fetchExpenses = createAsyncThunk(
    "expenses/fetchExpenses",
    async (filters: Partial<ExpenseFilters> | undefined, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (filters?.category && filters.category !== "all") {
                params.set("category", filters.category);
            }
            if (filters?.month) {
                params.set("month", filters.month);
            }
            if (filters?.search) {
                params.set("search", filters.search);
            }

            const qs = params.toString();
            const res = await fetch(`/api/expenses${qs ? `?${qs}` : ""}`);
            if (!res.ok) throw new Error("Failed to fetch expenses");
            return (await res.json()) as Expense[];
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
                state.expenses = action.payload;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
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
