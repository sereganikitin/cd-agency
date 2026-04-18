"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Section, Work } from "@/lib/db";

type WorkRow = Work & { section_slug: string; section_title: string };

export function WorksManager({
  sections,
  initialWorks,
}: {
  sections: Section[];
  initialWorks: WorkRow[];
}) {
  const router = useRouter();
  const [works, setWorks] = useState<WorkRow[]>(initialWorks);
  const [sectionId, setSectionId] = useState<number>(sections[0]?.id ?? 0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<number | "all">("all");

  const filtered = useMemo(
    () => (filterSection === "all" ? works : works.filter((w) => w.section_id === filterSection)),
    [works, filterSection]
  );

  async function handleFileUpload(file: File) {
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
      const res = await fetch("/api/works", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          section_id: sectionId,
          title,
          description,
          image_url: imageUrl,
          link_url: linkUrl,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка");
      const created = (await res.json()) as Work;
      const section = sections.find((s) => s.id === created.section_id)!;
      setWorks((w) => [
        { ...created, section_slug: section.slug, section_title: section.title },
        ...w,
      ]);
      setTitle("");
      setDescription("");
      setImageUrl("");
      setLinkUrl("");
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Удалить работу?")) return;
    const res = await fetch(`/api/works/${id}`, { method: "DELETE" });
    if (res.ok) {
      setWorks((w) => w.filter((x) => x.id !== id));
      router.refresh();
    }
  }

  async function moveToSection(id: number, newSectionId: number) {
    const res = await fetch(`/api/works/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ section_id: newSectionId }),
    });
    if (res.ok) {
      const updated = (await res.json()) as Work;
      const section = sections.find((s) => s.id === updated.section_id)!;
      setWorks((w) =>
        w.map((x) =>
          x.id === id ? { ...updated, section_slug: section.slug, section_title: section.title } : x
        )
      );
      router.refresh();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <form onSubmit={create} className="card p-6 space-y-3 h-fit">
        <h2 className="font-display text-2xl">Новая работа</h2>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/50">Раздел *</span>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(Number(e.target.value))}
            className="w-full rounded-xl border border-white/15 bg-midnight/60 px-4 py-3 text-sm outline-none focus:border-ember"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id} className="bg-midnight">
                {s.title}
              </option>
            ))}
          </select>
        </label>

        <Field label="Название" value={title} onChange={setTitle} required />
        <Field label="Описание" value={description} onChange={setDescription} textarea />

        <div className="space-y-2">
          <span className="block text-xs uppercase tracking-[0.18em] text-white/50">
            Изображение <span className="text-ember">*</span>
          </span>
          <div className="flex gap-2">
            <label className="btn-ghost cursor-pointer text-sm py-2 px-4">
              {uploading ? "Загружаем…" : "Загрузить файл"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />
            </label>
          </div>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="или вставьте URL изображения"
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

        <button className="btn-primary w-full" disabled={busy || !title.trim() || !imageUrl}>
          {busy ? "Сохраняем…" : "Добавить работу"}
        </button>
        {err && <p className="text-sm text-red-400">{err}</p>}
      </form>

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Все работы</h2>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="rounded-full border border-white/15 bg-midnight/60 px-3 py-1.5 text-sm outline-none focus:border-ember"
          >
            <option value="all" className="bg-midnight">Все разделы</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id} className="bg-midnight">
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">Работ пока нет.</p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {filtered.map((w) => (
              <li key={w.id} className="overflow-hidden rounded-xl border border-white/10 bg-midnight/40">
                <img src={w.image_url} alt={w.title} className="aspect-[4/3] w-full object-cover" />
                <div className="p-4 space-y-2">
                  <div className="font-medium">{w.title}</div>
                  {w.description && <div className="text-sm text-white/60 line-clamp-2">{w.description}</div>}
                  <select
                    value={w.section_id}
                    onChange={(e) => moveToSection(w.id, Number(e.target.value))}
                    className="w-full rounded-full border border-white/15 bg-midnight/60 px-3 py-1.5 text-xs outline-none focus:border-ember"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id} className="bg-midnight">
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                      onClick={() => remove(w.id)}
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
