import { useCallback, useState } from "react";
import type { Expense, ExpenseCategory } from "@/types/expense";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExpenseFormValues {
    title: string;
    amount: string; // kept as string for input binding; converted to cents on submit
    category: ExpenseCategory;
    date: string;
    note: string;
}

interface ExpenseFormErrors {
    title?: string;
    amount?: string;
    category?: string;
    date?: string;
}

interface UseExpenseFormReturn {
    values: ExpenseFormValues;
    handleChange: (
        field: keyof ExpenseFormValues,
        value: string
    ) => void;
    errors: ExpenseFormErrors;
    handleSubmit: (
        onSubmit: (data: {
            title: string;
            amount: number;
            category: ExpenseCategory;
            date: string;
            note?: string;
        }) => void | Promise<void>
    ) => void;
    reset: () => void;
}

// ---------------------------------------------------------------------------
// Allowed categories (for validation)
// ---------------------------------------------------------------------------

const VALID_CATEGORIES: ExpenseCategory[] = [
    "food",
    "transport",
    "housing",
    "health",
    "entertainment",
    "education",
    "shopping",
    "other",
];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useExpenseForm(
    initialValues?: Partial<Expense>
): UseExpenseFormReturn {
    const getDefaults = useCallback((): ExpenseFormValues => {
        return {
            title: initialValues?.title ?? "",
            amount: initialValues?.amount
                ? (initialValues.amount / 100).toFixed(2)
                : "",
            category: initialValues?.category ?? "food",
            date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
            note: initialValues?.note ?? "",
        };
    }, [initialValues]);

    const [values, setValues] = useState<ExpenseFormValues>(getDefaults);
    const [errors, setErrors] = useState<ExpenseFormErrors>({});

    const handleChange = useCallback(
        (field: keyof ExpenseFormValues, value: string) => {
            setValues((prev) => ({ ...prev, [field]: value }));
            // Clear field error on change
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        },
        []
    );

    const validate = useCallback((): ExpenseFormErrors => {
        const errs: ExpenseFormErrors = {};

        if (!values.title.trim()) {
            errs.title = "Title must not be empty";
        }

        const parsed = parseFloat(values.amount);
        if (isNaN(parsed) || parsed <= 0) {
            errs.amount = "Amount must be greater than 0";
        }

        if (
            !values.category ||
            !VALID_CATEGORIES.includes(values.category as ExpenseCategory)
        ) {
            errs.category = "Select a valid category";
        }

        if (!values.date || !DATE_REGEX.test(values.date)) {
            errs.date = "Date must be a valid YYYY-MM-DD";
        } else {
            const d = new Date(values.date);
            if (isNaN(d.getTime())) {
                errs.date = "Date is not a valid calendar date";
            }
        }

        return errs;
    }, [values]);

    const handleSubmit = useCallback(
        (
            onSubmit: (data: {
                title: string;
                amount: number;
                category: ExpenseCategory;
                date: string;
                note?: string;
            }) => void | Promise<void>
        ) => {
            const errs = validate();
            setErrors(errs);

            if (Object.keys(errs).length > 0) return;

            onSubmit({
                title: values.title.trim(),
                amount: Math.round(parseFloat(values.amount) * 100), // convert to cents
                category: values.category,
                date: values.date,
                note: values.note.trim() || undefined,
            });
        },
        [validate, values]
    );

    const reset = useCallback(() => {
        setValues(getDefaults());
        setErrors({});
    }, [getDefaults]);

    return { values, handleChange, errors, handleSubmit, reset };
}
