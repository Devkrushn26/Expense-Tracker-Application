import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { MonthlyBudget } from "@/types/expense";



interface BudgetState {
    budgets: MonthlyBudget[];
    status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: BudgetState = {
    budgets: [],
    status: "idle",
};


// Async Thunks

export const fetchBudgets = createAsyncThunk(
    "budget/fetchBudgets",
    async (_: void, { rejectWithValue }) => {
        try {
            const res = await fetch("/api/budget");
            if (!res.ok) throw new Error("Failed to fetch budgets");
            return (await res.json()) as MonthlyBudget[];
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

/** GET /api/budget?month=YYYY-MM */
export const fetchBudget = createAsyncThunk(
    "budget/fetchBudget",
    async (month: string, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/budget?month=${month}`);
            if (!res.ok) throw new Error("Failed to fetch budget");
            return (await res.json()) as MonthlyBudget;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

export const deleteBudget = createAsyncThunk(
    "budget/deleteBudget",
    async (month: string, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/budget?month=${month}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete budget");
            return month;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);

/** POST /api/budget — create or replace budget */
export const setBudget = createAsyncThunk(
    "budget/setBudget",
    async (data: { month: string; amount: number }, { rejectWithValue }) => {
        try {
            const res = await fetch("/api/budget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to set budget");
            return (await res.json()) as MonthlyBudget;
        } catch (err) {
            return rejectWithValue((err as Error).message);
        }
    }
);




// Slice


const budgetSlice = createSlice({
    name: "budget",
    initialState,
    reducers: {
        setBudgets(state, action: PayloadAction<MonthlyBudget[]>) {
            state.budgets = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBudgets.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchBudgets.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.budgets = action.payload;
            })
            .addCase(fetchBudgets.rejected, (state) => {
                state.status = "failed";
            });

        // fetchBudget
        builder
            .addCase(fetchBudget.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchBudget.fulfilled, (state, action) => {
                state.status = "succeeded";
                const idx = state.budgets.findIndex((b) => b.month === action.payload.month);
                if (idx !== -1) {
                    state.budgets[idx] = action.payload;
                } else {
                    state.budgets.push(action.payload);
                }
            })
            .addCase(fetchBudget.rejected, (state) => {
                state.status = "failed";
            });


        builder
            .addCase(setBudget.pending, (state) => {
                state.status = "loading";
            })
            .addCase(setBudget.fulfilled, (state, action) => {
                state.status = "succeeded";
                const idx = state.budgets.findIndex((b) => b.month === action.payload.month);
                if (idx !== -1) {
                    state.budgets[idx] = action.payload;
                } else {
                    state.budgets.push(action.payload);
                }
            })
            .addCase(setBudget.rejected, (state) => {
                state.status = "failed";
            });

        builder
            .addCase(deleteBudget.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteBudget.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.budgets = state.budgets.filter((budget) => budget.month !== action.payload);
            })
            .addCase(deleteBudget.rejected, (state) => {
                state.status = "failed";
            });
    },
});

export const { setBudgets } = budgetSlice.actions;
export default budgetSlice.reducer;
