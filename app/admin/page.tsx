import Link from "next/link";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function AdminOverview() {
  const db = getDb();
  const [{ c: sectionsCount }] = [db.prepare("SELECT COUNT(*) as c FROM sections").get()] as any[];
  const [{ c: worksCount }] = [db.prepare("SELECT COUNT(*) as c FROM works").get()] as any[];
  const [{ c: leadsNew }] = [db.prepare("SELECT COUNT(*) as c FROM leads WHERE handled = 0").get()] as any[];
  const [{ c: leadsAll }] = [db.prepare("SELECT COUNT(*) as c FROM leads").get()] as any[];

  const recentLeads = db
    .prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 5")
    .all() as any[];

  const stats = [
    { k: sectionsCount, v: "Разделов", href: "/admin/sections" },
    { k: worksCount, v: "Работ в галерее", href: "/admin/works" },
    { k: leadsNew, v: "Новых заявок", href: "/admin/leads" },
    { k: leadsAll, v: "Всего заявок", href: "/admin/leads" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.v}
            href={s.href}
            className="card p-6 transition hover:border-ember/50"
          >
            <div className="font-display text-5xl text-spark">{s.k}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/50">{s.v}</div>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Последние заявки</h2>
          <Link href="/admin/leads" className="text-sm text-ember hover:text-spark">
            Все заявки →
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">Пока нет заявок.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {recentLeads.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-sm text-white/50">{l.contact}</div>
                  {l.message && (
                    <div className="mt-1 text-sm text-white/70 line-clamp-2">{l.message}</div>
                  )}
                </div>
                <div className="text-xs text-white/40">{l.created_at}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/sections" className="card group p-6 transition hover:border-ember/50">
          <div className="text-xs uppercase tracking-[0.18em] text-ember">Быстрое действие</div>
          <h3 className="mt-2 font-display text-2xl">Добавить раздел галереи</h3>
          <p className="mt-2 text-sm text-white/60">
            Новый раздел появится как фильтр на странице /gallery.
          </p>
          <span className="mt-4 inline-block text-ember group-hover:translate-x-1 transition">→</span>
        </Link>
        <Link href="/admin/works" className="card group p-6 transition hover:border-ember/50">
          <div className="text-xs uppercase tracking-[0.18em] text-ember">Быстрое действие</div>
          <h3 className="mt-2 font-display text-2xl">Загрузить работу</h3>
          <p className="mt-2 text-sm text-white/60">
            Залейте изображение, привяжите к разделу — готово.
          </p>
          <span className="mt-4 inline-block text-ember group-hover:translate-x-1 transition">→</span>
        </Link>
      </div>
    </div>
  );
}
