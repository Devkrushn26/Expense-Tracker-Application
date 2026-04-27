"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCurrency, type Currency } from "@/context/CurrencyContext";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "USD", symbol: "$" },
  { value: "EUR", label: "EUR", symbol: "\u20ac" },
  { value: "GBP", label: "GBP", symbol: "\u00a3" },
  { value: "INR", label: "INR", symbol: "\u20b9" },
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
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get the initial session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Reactively update on login / logout / token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isLoggedIn = !!session;

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
          <span className="text-2xl">{"\ud83d\udcb0"}</span>
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

          {isLoggedIn ? (
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
          ) : (
            <Link
              href="/login"
              className="ml-2 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                border: "1px solid rgba(99,102,241,0.35)",
                color: "#a78bfa",
                background: "rgba(99,102,241,0.08)",
              }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
