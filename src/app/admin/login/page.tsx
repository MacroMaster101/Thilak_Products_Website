"use client";

import { useActionState } from "react";
import { login } from "./actions";

const labelClass = "block text-sm font-medium text-cream";
const inputClass =
  "mt-1 w-full rounded-lg border border-gold/15 bg-surface-2 px-4 py-2.5 text-cream placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-cream">
        Admin Sign In
      </h1>
      <p className="mt-2 text-muted">Manage your products and listings.</p>

      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-full bg-gold px-8 py-3 font-semibold text-bg shadow-sm transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
