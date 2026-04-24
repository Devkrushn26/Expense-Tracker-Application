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
 
    formatAmount: (cents: number) => string;

    toUsdCents: (localValue: number) => number;
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
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.5,
};

const STORAGE_KEY = "expense-tracker-currency";


// Context


const CurrencyContext = createContext<CurrencyContextValue | undefined>(
    undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>("USD");
    const [hydrated, setHydrated] = useState(false);

    
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
            if (stored && stored in CURRENCY_LOCALE) {
                setCurrencyState(stored);
            }
        } catch {

        }
        setHydrated(true);
    }, []);

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
        (cents: number): string => {
            const usdAmount = cents / 100;
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


    const toUsdCents = useCallback(
        (localValue: number): number => {
            const usdAmount = localValue / EXCHANGE_RATES[currency];
            return Math.round(usdAmount * 100);
        },
        [currency]
    );


    if (!hydrated) {
        return null;
    }

    return (
        <CurrencyContext.Provider
            value={{ currency, setCurrency, formatAmount, toUsdCents, currencySymbol, locale }}
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
