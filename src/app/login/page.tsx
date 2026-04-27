"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "login") {
        const result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (result.error) {
          setError(result.error.message);
          return;
        }

        setMessage("Login successful");
        router.push("/");
        router.refresh();
        return;
      }

      const signUp = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (signUp.error) {
        setError(signUp.error.message);
        return;
      }

      setMessage("Please login");
      setMode("login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "5rem auto", padding: "1rem" }}>
      <div
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: 16,
          padding: "1.5rem",
          backdropFilter: "blur(16px)",
        }}
      >
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
          {mode === "login" ? "Login" : "Create Account"}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          {mode === "login"
            ? "Sign in to access your expenses"
            : "Sign up to start tracking expenses"}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: 6, color: "var(--text-muted)" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={function (e) {
                setEmail(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-default)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: 6, color: "var(--text-muted)" }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={function (e) {
                setPassword(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-default)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {error ? (
            <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: 10 }}>{error}</p>
          ) : null}

          {message ? (
            <p style={{ color: "#34d399", fontSize: "0.85rem", marginBottom: 10 }}>{message}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "10px 14px", fontWeight: 600, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          onClick={function () {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
            setMessage("");
          }}
          style={{
            marginTop: 10,
            width: "100%",
            background: "transparent",
            border: "none",
            color: "#818cf8",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </main>
  );
}
