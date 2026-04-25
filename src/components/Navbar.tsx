"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrency, type Currency } from "@/context/CurrencyContext";
import { supabase } from "@/lib/supabase/client";

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
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(15, 17, 23, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">💰</span>
          <span
            className="text-lg font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Expense Tracker
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  color: isActive ? "#a78bfa" : "var(--text-secondary)",
                  background: isActive ? "rgba(99, 102, 241, 0.1)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="w-px h-6 mx-2" style={{ background: "var(--border-default)" }} />

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.symbol} {c.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="ml-2 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{
              border: "1px solid rgba(239,68,68,0.35)",
              color: "#f87171",
              background: "rgba(239,68,68,0.08)",
              opacity: loggingOut ? 0.7 : 1,
              cursor: loggingOut ? "not-allowed" : "pointer",
            }}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </nav>
  );
}