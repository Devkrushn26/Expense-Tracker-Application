import { useCallback, useState } from "react";
import type { Expense, ExpenseCategory } from "@/types/expense";


// Types


interface ExpenseFormValues {
    title: string;
    amount: string; 
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
    errors: ExpenseFormErrors;
    handleChange: (
        field: keyof ExpenseFormValues,
        value: string
    ) => void;
    handleSubmit: (
        onSubmit: (data: {
            title: string;
            amount: number;
            category: ExpenseCategory;
            date: string;
            note?: string;
        }) => void | Promise<void>
    ) => Promise<void>;
    reset: () => void;
}


// Allowed categories (for validation)


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

function isValidDateString(value: string) {
    if (!DATE_REGEX.test(value)) return false;

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}


// Hook

export function useExpenseForm(
    initialValues?: Partial<Expense>
): UseExpenseFormReturn {
    const getDefaults = useCallback((): ExpenseFormValues => {
        return {
            title: initialValues?.title ?? "",
            amount: initialValues?.amount
                ? initialValues.amount.toFixed(2)
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
        } else if (!isValidDateString(values.date)) {
            errs.date = "Date is not a valid calendar date";
        }

        return errs;
    }, [values]);

    const handleSubmit = useCallback(
        async (
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

            await onSubmit({
                title: values.title.trim(),
                amount: parseFloat(values.amount),
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

    return {
        values,
        errors,
        handleChange,
        handleSubmit,
        reset,
    };
}
