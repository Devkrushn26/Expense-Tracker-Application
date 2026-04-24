"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function DemoLogin() {
    const [hasSession, setHasSession] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get("error");

    useEffect(() => {
        // Check if session cookie exists
        const session = document.cookie
            .split("; ")
            .find((row) => row.startsWith("user_session="));
        setHasSession(!!session);
    }, []);

    const handleLogin = () => {
        // Set a dummy session cookie for 24 hours
        document.cookie = "user_session=demo; path=/; max-age=86400";
        setHasSession(true);
        router.refresh();
    };

    if (hasSession && !error) return null;

    return (
        <div className="glass-card mb-8 overflow-hidden border-indigo-500/30 bg-indigo-500/5 p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-indigo-400">
                        Welcome to the Demo! 🚀
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {error === "session_required"
                            ? "This section is protected. Please click the button below to start your session."
                            : "Click the button to enable all interactive features."}
                    </p>
                </div>
                <button
                    onClick={handleLogin}
                    className="btn-primary px-8 py-3 text-sm whitespace-nowrap shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                >
                    Start Demo Session
                </button>
            </div>
        </div>
    );
}
