"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export type Currency = "USD" | "EUR" | "GBP" | "INR";

interface CurrencyContextValue {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    formatAmount: (usdAmount: number) => string;
    toUsdAmount: (localValue: number) => number;
    fromUsdAmount: (usdAmount: number) => number;
    currencySymbol: string;
    locale: string;
}

const CURRENCY_LOCALE: Record<Currency, string> = {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    INR: "en-IN",
};

const CURRENCY_SYMBOL: Record<Currency, string> = {
    USD: "$",
    EUR: "\u20ac",
    GBP: "\u00a3",
    INR: "\u20b9",
};

const EXCHANGE_RATES: Record<Currency, number> = {
    USD: 1,
    EUR: 0.8531,
    GBP: 0.7389,
    INR: 94.2505,
};

const STORAGE_KEY = "expense-tracker-currency";

function roundAmount(value: number, decimals = 6): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}

function getStoredCurrency(): Currency | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
        if (stored && stored in CURRENCY_LOCALE) {
            return stored;
        }
    } catch {
        // Ignore storage read failures and keep the default currency.
    }

    return null;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>("USD");

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const stored = getStoredCurrency();
            if (stored) {
                setCurrencyState(stored);
            }
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const setCurrency = useCallback((c: Currency) => {
        setCurrencyState(c);
        try {
            localStorage.setItem(STORAGE_KEY, c);
        } catch {
            // Ignore storage write failures; the in-memory selection still works.
        }
    }, []);

    const locale = CURRENCY_LOCALE[currency];
    const currencySymbol = CURRENCY_SYMBOL[currency];

    const formatAmount = useCallback(
        (usdAmount: number): string => {
            const converted = usdAmount * EXCHANGE_RATES[currency];
            return new Intl.NumberFormat(locale, {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(converted);
        },
        [currency, locale]
    );

    const toUsdAmount = useCallback(
        (localValue: number): number => roundAmount(localValue / EXCHANGE_RATES[currency]),
        [currency]
    );

    const fromUsdAmount = useCallback(
        (usdAmount: number): number => roundAmount(usdAmount * EXCHANGE_RATES[currency]),
        [currency]
    );

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                setCurrency,
                formatAmount,
                toUsdAmount,
                fromUsdAmount,
                currencySymbol,
                locale,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency(): CurrencyContextValue {
    const ctx = useContext(CurrencyContext);
    if (!ctx) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return ctx;
}
