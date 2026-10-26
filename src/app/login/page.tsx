"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Delete, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  function handleKeyPress(num: string) {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError("");
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  }

  function handleBackspace() {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }

  async function submitPin(pinToSubmit: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinToSubmit }),
      });

      if (res.ok) {
        router.push(from);
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect PIN code");
        setPin("");
      }
    } catch (err: any) {
      setError("Network or server error");
      setPin("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 max-w-sm mx-auto w-full pt-safe pb-safe select-none">
      {/* Top Header */}
      <div className="text-center mt-8">
        <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 mb-3 shadow-lg shadow-red-500/10">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-white tracking-tight font-mono uppercase">
          DO OR DIE
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          High-Stakes Disciplined Routine Gate
        </p>
      </div>

      {/* PIN Dots Area */}
      <div className="my-6 text-center">
        <div className="flex justify-center items-center gap-3.5 mb-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? "bg-red-500 scale-125 shadow-md shadow-red-500/50"
                    : "bg-zinc-800 border border-zinc-700"
                }`}
              />
            );
          })}
        </div>

        {error ? (
          <p className="text-xs text-red-400 font-mono mt-3">
            {error}
          </p>
        ) : (
          <p className="text-[11px] text-zinc-500 font-mono mt-3">
            Enter 4-digit master PIN (Default: 1234)
          </p>
        )}
      </div>

      {/* Numeric Mobile Keypad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKeyPress(n)}
            disabled={loading}
            className="h-16 rounded-2xl bg-[#121218] border border-zinc-800 text-white font-mono text-xl font-bold hover:bg-zinc-800 active:scale-95 transition-all shadow-sm flex items-center justify-center"
          >
            {n}
          </button>
        ))}

        <div className="flex items-center justify-center text-xs text-zinc-600 font-mono">
          <ShieldCheck className="w-5 h-5 text-zinc-600" />
        </div>

        <button
          type="button"
          onClick={() => handleKeyPress("0")}
          disabled={loading}
          className="h-16 rounded-2xl bg-[#121218] border border-zinc-800 text-white font-mono text-xl font-bold hover:bg-zinc-800 active:scale-95 transition-all shadow-sm flex items-center justify-center"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          disabled={loading || pin.length === 0}
          className="h-16 rounded-2xl bg-[#121218] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all shadow-sm flex items-center justify-center disabled:opacity-40"
          aria-label="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}
