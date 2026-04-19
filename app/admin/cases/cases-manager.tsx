"use client";

import { useMemo, useState } from "react";
import type { Case, Direction } from "@/lib/db";

export function CasesManager({
  directions,
  initial,
}: {
  directions: Direction[];
  initial: Case[];
}) {
  const [cases, setCases] = useState<Case[]>(initial);
  const [direction, setDirection] = useState<string>(directions[0]?.slug || "");
  const [typeTitle, setTypeTitle] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filterDir, setFilterDir] = useState<string>("all");

  const filtered = useMemo(
    () => (filterDir === "all" ? cases : cases.filter((c) => c.direction === filterDir)),
    [cases, filterDir]
  );

  // Known type titles for the current direction (autocomplete hint)
  const knownTypes = useMemo(() => {
    const map = new Map<string, string>();
    cases
      .filter((c) => c.direction === direction)
      .forEach((c) => map.set(c.type_slug, c.type_title));
    return Array.from(map.values());
  }, [cases, direction]);

  async function uploadFile(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка загрузки");
      const data = await res.json();
      setImageUrl(data.url);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          direction,
          type_title: typeTitle,
          title,
          description,
          image_url: imageUrl,
          link_url: linkUrl,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка");
      const created = (await res.json()) as Case;
      setCases((x) => [created, ...x]);
      setTitle("");
      setDescription("");
      setImageUrl("");
      setLinkUrl("");
      // keep direction and typeTitle for quick batch entry
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Удалить кейс?")) return;
    const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
    if (res.ok) setCases((x) => x.filter((c) => c.id !== id));
  }

  async function moveTo(id: number, patch: { direction?: string; type_title?: string }) {
    const res = await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = (await res.json()) as Case;
      setCases((x) => x.map((c) => (c.id === id ? updated : c)));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <form onSubmit={create} className="card h-fit space-y-3 p-6">
        <h2 className="font-display text-2xl">Новый кейс</h2>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/50">Направление *</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
          >
            {directions.map((d) => (
              <option key={d.slug} value={d.slug} className="bg-midnight">
                {d.kicker} · {d.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/50">
            Тип кейса <span className="text-ember">*</span>
          </span>
          <input
            list="types-hint"
            value={typeTitle}
            onChange={(e) => setTypeTitle(e.target.value)}
            placeholder="например: Лендинг, Рилс, Контекстная реклама"
            required
            className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
          />
          <datalist id="types-hint">
            {knownTypes.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <span className="mt-1 block text-[11px] text-white/40">
            Кейсы с одинаковым типом объединятся в фильтр на странице направления.
          </span>
        </label>

        <Field label="Название кейса" value={title} onChange={setTitle} required />
        <Field label="Описание" value={description} onChange={setDescription} textarea />

        <div className="space-y-2">
          <span className="block text-xs uppercase tracking-[0.18em] text-white/50">
            Изображение <span className="text-ember">*</span>
          </span>
          <label className="btn-ghost inline-flex cursor-pointer text-sm py-2 px-4">
            {uploading ? "Загружаем…" : "Загрузить файл"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
              }}
            />
          </label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="или URL"
            className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="preview"
              className="aspect-[4/3] w-full rounded-xl border border-white/10 object-cover"
            />
          )}
        </div>

        <Field label="Ссылка на кейс (опционально)" value={linkUrl} onChange={setLinkUrl} placeholder="https://…" />

        <button
          className="btn-primary w-full"
          disabled={busy || !title.trim() || !typeTitle.trim() || !imageUrl}
        >
          {busy ? "Сохраняем…" : "Добавить кейс"}
        </button>
        {err && <p className="text-sm text-red-400">{err}</p>}
      </form>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Все кейсы</h2>
          <select
            value={filterDir}
            onChange={(e) => setFilterDir(e.target.value)}
            className="rounded-full border border-white/15 bg-midnight/60 px-3 py-1.5 text-sm outline-none focus:border-ember"
          >
            <option value="all" className="bg-midnight">Все направления</option>
            {directions.map((d) => (
              <option key={d.slug} value={d.slug} className="bg-midnight">
                {d.title}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">Кейсов пока нет.</p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {filtered.map((c) => {
              const d = directions.find((x) => x.slug === c.direction);
              return (
                <li key={c.id} className="overflow-hidden rounded-xl border border-white/10 bg-midnight/40">
                  <img src={c.image_url} alt={c.title} className="aspect-[4/3] w-full object-cover" />
                  <div className="space-y-2 p-4">
                    <div className="flex items-center gap-2">
                      <span className="chip !text-[10px] !py-0.5">{d?.title || c.direction}</span>
                      <span className="chip !text-[10px] !py-0.5 border-ember/40 text-ember">{c.type_title}</span>
                    </div>
                    <div className="font-medium">{c.title}</div>
                    {c.description && <p className="text-sm text-white/60 line-clamp-2">{c.description}</p>}
                    <select
                      value={c.direction}
                      onChange={(e) => moveTo(c.id, { direction: e.target.value })}
                      className="w-full rounded-full border border-white/15 bg-midnight/60 px-3 py-1.5 text-xs outline-none focus:border-ember"
                    >
                      {directions.map((dd) => (
                        <option key={dd.slug} value={dd.slug} className="bg-midnight">
                          {dd.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => remove(c.id)}
                      className="w-full rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
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
