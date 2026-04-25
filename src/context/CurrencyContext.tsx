"use client";

import {
    createContext,
    useCallback,
    useContext,
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
    EUR: "€",
    GBP: "£",
    INR: "₹",
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

function getInitialCurrency(): Currency {
    if (typeof window === "undefined") {
        return "USD";
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
        if (stored && stored in CURRENCY_LOCALE) {
            return stored;
        }
    } catch {
        // Ignore storage read failures and fall back to USD.
    }

    return "USD";
}


// Context


const CurrencyContext = createContext<CurrencyContextValue | undefined>(
    undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>(getInitialCurrency);

    const setCurrency = useCallback((c: Currency) => {
        setCurrencyState(c);
        try {
            localStorage.setItem(STORAGE_KEY, c);
        } catch {
            
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
        (localValue: number): number => {
            return roundAmount(localValue / EXCHANGE_RATES[currency]);
        },
        [currency]
    );

    const fromUsdAmount = useCallback(
        (usdAmount: number): number => {
            return roundAmount(usdAmount * EXCHANGE_RATES[currency]);
        },
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


// Hook


export function useCurrency(): CurrencyContextValue {
    const ctx = useContext(CurrencyContext);
    if (!ctx) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return ctx;
}
