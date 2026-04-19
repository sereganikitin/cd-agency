"use client";

import { useState } from "react";
import type { Section } from "@/lib/db";

export function SectionsManager({ initial }: { initial: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initial);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description, slug }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка");
      const created = await res.json();
      setSections((s) => [...s, created]);
      setTitle("");
      setDescription("");
      setSlug("");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function update(id: number, patch: Partial<Section>) {
    const res = await fetch(`/api/sections/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setSections((s) => s.map((x) => (x.id === id ? updated : x)));
    }
  }

  async function remove(id: number) {
    if (!confirm("Удалить раздел? Все работы в нём тоже будут удалены.")) return;
    const res = await fetch(`/api/sections/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSections((s) => s.filter((x) => x.id !== id));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={create} className="card p-6 space-y-3 h-fit">
        <h2 className="font-display text-2xl">Новый раздел</h2>
        <Field label="Название" value={title} onChange={setTitle} required />
        <Field label="Описание" value={description} onChange={setDescription} textarea />
        <Field label="Slug (опционально)" value={slug} onChange={setSlug} placeholder="автоматически из названия" />
        <button className="btn-primary w-full" disabled={busy || !title.trim()}>
          {busy ? "Создаём…" : "Добавить раздел"}
        </button>
        {err && <p className="text-sm text-red-400">{err}</p>}
      </form>

      <div className="card p-6">
        <h2 className="font-display text-2xl">Существующие разделы</h2>
        {sections.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">Разделов пока нет.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {sections.map((s) => (
              <SectionRow key={s.id} section={s} onUpdate={update} onRemove={remove} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SectionRow({
  section,
  onUpdate,
  onRemove,
}: {
  section: Section;
  onUpdate: (id: number, patch: Partial<Section>) => void;
  onRemove: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [description, setDescription] = useState(section.description || "");

  if (editing) {
    return (
      <li className="py-4 space-y-2">
        <Field label="Название" value={title} onChange={setTitle} />
        <Field label="Описание" value={description} onChange={setDescription} textarea />
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary text-sm py-2 px-4"
            onClick={() => {
              onUpdate(section.id, { title, description: description || null });
              setEditing(false);
            }}
          >
            Сохранить
          </button>
          <button type="button" className="btn-ghost text-sm py-2 px-4" onClick={() => setEditing(false)}>
            Отмена
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <div className="font-medium">{section.title}</div>
        <div className="text-xs text-white/40">/gallery?section={section.slug}</div>
        {section.description && (
          <p className="mt-1 text-sm text-white/60">{section.description}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          className="rounded-full border border-white/15 px-3 py-1 text-xs hover:border-ember"
          onClick={() => setEditing(true)}
        >
          Редактировать
        </button>
        <button
          className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
          onClick={() => onRemove(section.id)}
        >
          Удалить
        </button>
      </div>
    </li>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  const cls =
    "w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/50">
        {label}
        {required && <span className="text-ember"> *</span>}
      </span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </label>
  );
}
