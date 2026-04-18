"use client";

import { useState } from "react";

export function LeadForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, source: "site-home" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка отправки");
      setStatus("ok");
      form.reset();
    } catch (err: any) {
      setStatus("err");
      setError(err.message || "Ошибка отправки");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-ember/40 bg-ember/10 p-10 text-center">
        <div className="font-display text-3xl">Поймали момент.</div>
        <p className="mt-3 text-white/70">
          Заявка получена. Вернёмся с предложением в течение 24 часов.
        </p>
        <button className="mt-6 btn-ghost" onClick={() => setStatus("idle")}>
          Отправить ещё одну
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field name="name" label="Как к вам обращаться" required />
      <Field name="contact" label="Email или telegram" required />
      <Field name="message" label="О проекте в двух словах" textarea />
      <button className="btn-primary w-full" disabled={status === "loading"}>
        {status === "loading" ? "Отправляем…" : "Отправить заявку"}
      </button>
      {status === "err" && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <p className="pt-2 text-xs text-white/40">
        Отправляя форму, вы соглашаетесь с обработкой персональных данных.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  textarea,
}: {
  name: string;
  label: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none transition focus:border-ember focus:bg-midnight";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/50">
        {label}
        {required && <span className="text-ember"> *</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} rows={4} className={cls} />
      ) : (
        <input name={name} required={required} className={cls} />
      )}
    </label>
  );
}
