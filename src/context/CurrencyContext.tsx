"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Currency = "USD" | "EUR" | "GBP" | "INR";

interface CurrencyContextValue {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    formatAmount: (cents: number) => string;
    locale: string;
}

// ---------------------------------------------------------------------------
// Locale mapping
// ---------------------------------------------------------------------------

const CURRENCY_LOCALE: Record<Currency, string> = {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    INR: "en-IN",
};

const STORAGE_KEY = "expense-tracker-currency";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
    undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>("USD");
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
            if (stored && stored in CURRENCY_LOCALE) {
                setCurrencyState(stored);
            }
        } catch {
            // localStorage not available (SSR / incognito)
        }
        setHydrated(true);
    }, []);

    // Persist to localStorage when currency changes
    const setCurrency = useCallback((c: Currency) => {
        setCurrencyState(c);
        try {
            localStorage.setItem(STORAGE_KEY, c);
        } catch {
            // ignore
        }
    }, []);

    const locale = CURRENCY_LOCALE[currency];

    const formatAmount = useCallback(
        (cents: number): string => {
            return new Intl.NumberFormat(locale, {
                style: "currency",
                currency,
            }).format(cents / 100);
        },
        [currency, locale]
    );

    // Prevent hydration mismatch — render children only after client-side hydration
    if (!hydrated) {
        return null;
    }

    return (
        <CurrencyContext.Provider
            value={{ currency, setCurrency, formatAmount, locale }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCurrency(): CurrencyContextValue {
    const ctx = useContext(CurrencyContext);
    if (!ctx) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return ctx;
}
