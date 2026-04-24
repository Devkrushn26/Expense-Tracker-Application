"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrency, type Currency } from "@/context/CurrencyContext";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
    { value: "USD", label: "USD", symbol: "$" },
    { value: "EUR", label: "EUR", symbol: "€" },
    { value: "GBP", label: "GBP", symbol: "£" },
    { value: "INR", label: "INR", symbol: "₹" },
];

const NAV_LINKS = [
    { href: "/", label: "Dashboard" },
    { href: "/expenses", label: "Expenses" },
    { href: "/add", label: "Add Expense" },
    { href: "/budget", label: "Budget" },
];

export default function Navbar() {
    const { currency, setCurrency } = useCurrency();
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 border-b"
            style={{
                background: 'rgba(15, 17, 23, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl">💰</span>
                    <span className="text-lg font-bold bg-clip-text text-transparent"
                        style={{ backgroundImage: 'var(--gradient-brand)' }}
                    >
                        Expense Tracker
                    </span>
                </Link>

                {/* Nav links */}
                <div className="flex items-center gap-1">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                style={{
                                    color: isActive ? '#a78bfa' : 'var(--text-secondary)',
                                    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                {link.label}
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="w-px h-6 mx-2" style={{ background: 'var(--border-default)' }} />

                    {/* Currency switcher */}
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as Currency)}
                        className="text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {CURRENCIES.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.symbol} {c.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </nav>
    );
}
