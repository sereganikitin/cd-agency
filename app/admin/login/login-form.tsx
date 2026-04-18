"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(fd);
      if (result?.error) setErr(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/50">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/50">Пароль</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
        />
      </label>
      <button className="btn-primary w-full" disabled={isPending}>
        {isPending ? "Входим…" : "Войти"}
      </button>
      {err && <p className="text-sm text-red-400">{err}</p>}
    </form>
  );
}
