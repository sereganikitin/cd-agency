"use client";

import { useState, useRef } from "react";

type Item = {
  slot: string;
  title: string;
  description: string;
  url: string;
  isDefault: boolean;
  aspect: string;
  default: string;
};

export function ImagesManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <ImageCard
          key={item.slot}
          item={item}
          onUpdate={(next) => {
            setItems((xs) => xs.map((x) => (x.slot === item.slot ? { ...x, ...next } : x)));
          }}
        />
      ))}
    </div>
  );
}

function ImageCard({
  item,
  onUpdate,
}: {
  item: Item;
  onUpdate: (next: Partial<Item>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [state, setState] = useState<"idle" | "uploading" | "saving" | "ok" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function save(url: string) {
    setState("saving");
    setErr(null);
    try {
      const res = await fetch(`/api/site-images/${item.slot}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка сохранения");
      onUpdate({ url, isDefault: false });
      setUrlInput("");
      setState("ok");
      setTimeout(() => setState("idle"), 1200);
    } catch (e: any) {
      setErr(e.message);
      setState("err");
    }
  }

  async function uploadFile(file: File) {
    setState("uploading");
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка загрузки");
      const data = await res.json();
      await save(data.url);
    } catch (e: any) {
      setErr(e.message);
      setState("err");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function reset() {
    if (!confirm("Сбросить на дефолтную заглушку?")) return;
    setState("saving");
    setErr(null);
    try {
      const res = await fetch(`/api/site-images/${item.slot}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка сброса");
      onUpdate({ url: item.default, isDefault: true });
      setState("ok");
      setTimeout(() => setState("idle"), 1200);
    } catch (e: any) {
      setErr(e.message);
      setState("err");
    }
  }

  const aspectClass =
    item.aspect === "16/9"
      ? "aspect-video"
      : item.aspect === "4/3"
        ? "aspect-[4/3]"
        : item.aspect === "3/2"
          ? "aspect-[3/2]"
          : "aspect-[2/1]";

  const busy = state === "uploading" || state === "saving";

  return (
    <div className="card overflow-hidden">
      <div className={`${aspectClass} relative w-full bg-midnight`}>
        <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-midnight/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-white">
              <Spinner />
              {state === "uploading" ? "Загружаем файл…" : "Сохраняем…"}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="text-xs text-white/50">{item.description}</div>
          </div>
          {item.isDefault ? (
            <span className="chip !text-[10px] !py-0.5">Дефолт</span>
          ) : (
            <span className="chip !text-[10px] !py-0.5 border-ember/40 text-ember">Своя</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-60"
          >
            {state === "uploading" ? "Загружаем…" : "📤 Загрузить файл"}
          </button>
          {!item.isDefault && (
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="rounded-full border border-red-500/40 px-4 py-2.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-60"
            >
              Сбросить
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
          }}
        />

        <details className="group">
          <summary className="cursor-pointer text-xs text-white/50 hover:text-white/80">
            или задать URL вручную
          </summary>
          <div className="mt-2 flex gap-2">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://…"
              className="flex-1 rounded-xl border border-white/15 bg-midnight/60 px-3 py-2 text-sm outline-none focus:border-ember"
            />
            <button
              type="button"
              disabled={!urlInput.trim() || busy}
              onClick={() => save(urlInput.trim())}
              className="rounded-full bg-ember px-4 py-2 text-xs font-medium text-midnight disabled:opacity-50"
            >
              Сохранить
            </button>
          </div>
        </details>

        {state === "ok" && <p className="text-xs text-emerald-400">✓ Сохранено</p>}
        {err && <p className="text-xs text-red-400">{err}</p>}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
