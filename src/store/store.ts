import { configureStore } from "@reduxjs/toolkit";
import expenseReducer from "./expenseSlice";
import budgetReducer from "./budgetSlice";

export const store = configureStore({
    reducer: {
        expenses: expenseReducer,
        budget: budgetReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
