"use client";

import { useState } from "react";
import type { Direction, DirectionBenefit } from "@/lib/db";

export function BenefitsManager({
  directions,
  initial,
}: {
  directions: Direction[];
  initial: Record<string, DirectionBenefit[]>;
}) {
  const [active, setActive] = useState<string>(directions[0]?.slug || "");
  const [byDir, setByDir] = useState<Record<string, DirectionBenefit[]>>(initial);
  const items = byDir[active] || [];

  function updateLocal(next: DirectionBenefit[]) {
    setByDir((s) => ({ ...s, [active]: next }));
  }

  async function create(title: string, description: string) {
    const res = await fetch("/api/benefits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ direction: active, title, description }),
    });
    if (!res.ok) {
      alert((await res.json().catch(() => ({}))).error || "Ошибка");
      return false;
    }
    const created = (await res.json()) as DirectionBenefit;
    updateLocal([...items, created]);
    return true;
  }

  async function update(id: number, patch: { title?: string; description?: string; position?: number }) {
    const res = await fetch(`/api/benefits/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      alert((await res.json().catch(() => ({}))).error || "Ошибка");
      return;
    }
    const updated = (await res.json()) as DirectionBenefit;
    updateLocal(items.map((x) => (x.id === id ? updated : x)));
  }

  async function remove(id: number) {
    if (!confirm("Удалить пункт?")) return;
    const res = await fetch(`/api/benefits/${id}`, { method: "DELETE" });
    if (res.ok) updateLocal(items.filter((x) => x.id !== id));
  }

  async function move(id: number, dir: -1 | 1) {
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    const a = items[idx];
    const b = items[next];
    // Optimistic swap
    const reordered = [...items];
    reordered[idx] = b;
    reordered[next] = a;
    updateLocal(reordered);
    await Promise.all([
      fetch(`/api/benefits/${a.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ position: b.position }),
      }),
      fetch(`/api/benefits/${b.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ position: a.position }),
      }),
    ]);
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-graphite/50 p-1 text-sm w-fit">
        {directions.map((d) => (
          <button
            key={d.slug}
            onClick={() => setActive(d.slug)}
            className={
              active === d.slug
                ? "rounded-full bg-ember px-4 py-1.5 text-midnight"
                : "rounded-full px-4 py-1.5 text-white/70 hover:text-white"
            }
          >
            {d.title}
          </button>
        ))}
      </nav>

      <NewBenefitForm onCreate={create} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="card p-8 text-center text-sm text-white/50">Пока нет пунктов.</div>
        ) : (
          items.map((b, i) => (
            <BenefitRow
              key={b.id}
              index={i}
              total={items.length}
              benefit={b}
              onUpdate={update}
              onRemove={remove}
              onMove={move}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NewBenefitForm({ onCreate }: { onCreate: (title: string, description: string) => Promise<boolean> }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await onCreate(title, description);
    if (ok) {
      setTitle("");
      setDescription("");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-6">
      <h2 className="font-display text-xl">Добавить пункт</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Заголовок"
        required
        className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание"
        required
        rows={3}
        className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
      />
      <button
        type="submit"
        className="btn-primary"
        disabled={busy || !title.trim() || description.trim().length < 5}
      >
        {busy ? "Добавляем…" : "Добавить"}
      </button>
    </form>
  );
}

function BenefitRow({
  benefit,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  benefit: DirectionBenefit;
  index: number;
  total: number;
  onUpdate: (id: number, patch: { title?: string; description?: string }) => void;
  onRemove: (id: number) => void;
  onMove: (id: number, dir: -1 | 1) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(benefit.title);
  const [description, setDescription] = useState(benefit.description);

  if (editing) {
    return (
      <div className="card space-y-3 p-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
        />
        <div className="flex gap-2">
          <button
            className="btn-primary text-sm py-2 px-4"
            onClick={() => {
              onUpdate(benefit.id, { title, description });
              setEditing(false);
            }}
          >
            Сохранить
          </button>
          <button className="btn-ghost text-sm py-2 px-4" onClick={() => setEditing(false)}>
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex items-start justify-between gap-4 p-5">
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            onClick={() => onMove(benefit.id, -1)}
            disabled={index === 0}
            className="text-white/40 hover:text-ember disabled:opacity-20"
            title="Выше"
          >
            ▲
          </button>
          <span className="font-display text-xs text-white/40">{String(index + 1).padStart(2, "0")}</span>
          <button
            onClick={() => onMove(benefit.id, 1)}
            disabled={index === total - 1}
            className="text-white/40 hover:text-ember disabled:opacity-20"
            title="Ниже"
          >
            ▼
          </button>
        </div>
        <div>
          <div className="font-medium">{benefit.title}</div>
          <p className="mt-1 text-sm text-white/60">{benefit.description}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => setEditing(true)}
          className="rounded-full border border-white/15 px-3 py-1 text-xs hover:border-ember"
        >
          Редактировать
        </button>
        <button
          onClick={() => onRemove(benefit.id)}
          className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
