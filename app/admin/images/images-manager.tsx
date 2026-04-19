"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  slot: string;
  title: string;
  description: string;
  url: string;
  isDefault: boolean;
  aspect: string;
};

export function ImagesManager({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initial);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <ImageCard
          key={item.slot}
          item={item}
          onChange={(url, isDefault) => {
            setItems((xs) => xs.map((x) => (x.slot === item.slot ? { ...x, url, isDefault } : x)));
            router.refresh();
          }}
        />
      ))}
    </div>
  );
}

function ImageCard({
  item,
  onChange,
}: {
  item: Item;
  onChange: (url: string, isDefault: boolean) => void;
}) {
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка");
      const data = await res.json();
      await save(data.url);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function save(url: string) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/site-images/${item.slot}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка");
      onChange(url, false);
      setUrlInput("");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!confirm("Сбросить на дефолтную заглушку?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/site-images/${item.slot}`, { method: "DELETE" });
      if (res.ok) {
        // After delete, default URL comes back via refresh
        onChange("", true);
      }
    } finally {
      setBusy(false);
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

  return (
    <div className="card overflow-hidden">
      <div className={`${aspectClass} w-full bg-midnight`}>
        <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
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

        <div className="flex flex-wrap gap-2">
          <label className="btn-ghost cursor-pointer text-sm py-2 px-4">
            {uploading ? "Загружаем…" : "Загрузить файл"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading || busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
              }}
            />
          </label>
          {!item.isDefault && (
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="rounded-full border border-red-500/40 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
            >
              Сбросить
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="или вставьте URL"
            className="flex-1 rounded-xl border border-white/15 bg-midnight/60 px-4 py-2 text-sm outline-none focus:border-ember"
          />
          <button
            type="button"
            disabled={!urlInput.trim() || busy}
            onClick={() => save(urlInput.trim())}
            className="rounded-full bg-ember px-3 py-2 text-xs text-midnight disabled:opacity-50"
          >
            Сохранить URL
          </button>
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}
      </div>
    </div>
  );
}
