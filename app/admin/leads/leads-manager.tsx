"use client";

import { useState } from "react";
import type { Lead } from "@/lib/db";
import { useRouter } from "next/navigation";

export function LeadsManager({ initial }: { initial: Lead[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initial);
  const [filter, setFilter] = useState<"all" | "new" | "handled">("new");

  const visible = leads.filter((l) =>
    filter === "all" ? true : filter === "new" ? l.handled === 0 : l.handled === 1
  );

  async function toggle(id: number, handled: boolean) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ handled }),
    });
    if (res.ok) {
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, handled: handled ? 1 : 0 } : l)));
      router.refresh();
    }
  }

  async function remove(id: number) {
    if (!confirm("Удалить заявку?")) return;
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLeads((ls) => ls.filter((l) => l.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="card p-6">
      <div className="flex gap-1 rounded-full border border-white/10 bg-midnight/60 p-1 text-sm w-fit">
        {(["new", "all", "handled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "rounded-full bg-ember px-3 py-1.5 text-midnight"
                : "rounded-full px-3 py-1.5 text-white/70 hover:text-white"
            }
          >
            {f === "new" ? "Новые" : f === "all" ? "Все" : "Обработанные"}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-white/50">Заявок нет.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((l) => (
            <li
              key={l.id}
              className={
                "rounded-xl border p-4 " +
                (l.handled ? "border-white/5 bg-midnight/30" : "border-ember/30 bg-ember/5")
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/70">{l.contact}</span>
                    {l.source && (
                      <span className="chip !py-0.5 !text-[10px]">{l.source}</span>
                    )}
                  </div>
                  {l.message && <p className="mt-2 text-sm text-white/70">{l.message}</p>}
                  <div className="mt-2 text-xs text-white/40">{l.created_at}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => toggle(l.id, l.handled === 0)}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs hover:border-ember"
                  >
                    {l.handled ? "Вернуть в новые" : "Обработано"}
                  </button>
                  <button
                    onClick={() => remove(l.id)}
                    className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
