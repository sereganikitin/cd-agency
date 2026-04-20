import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase, getDirection, listRelatedCases } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return {};
  const c = getCase(id);
  if (!c) return {};
  return {
    title: `${c.title} — Crab Digital Agency`,
    description: c.description?.slice(0, 160) || c.type_title,
  };
}

export default function CaseDetailPage({ params }: Props) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const c = getCase(id);
  if (!c) notFound();

  const dir = getDirection(c.direction);
  const related = listRelatedCases(c.direction, c.id, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${c.image_url})` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-midnight/80 via-midnight/90 to-midnight" />
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-16 md:pt-14">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50">
            <Link href="/" className="hover:text-white">Главная</Link>
            <span>›</span>
            <Link href="/#services" className="hover:text-white">Направления</Link>
            <span>›</span>
            {dir && (
              <>
                <Link href={`/services/${dir.slug}`} className="hover:text-white">{dir.title}</Link>
                <span>›</span>
              </>
            )}
            <span className="text-white">Кейс</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {dir && <span className="chip">{dir.title}</span>}
            <span className="chip border-ember/40 text-ember">{c.type_title}</span>
          </div>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl">
            {c.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <img src={c.image_url} alt={c.title} className="w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <article className="space-y-6">
            <span className="chip">О проекте</span>
            {c.description ? (
              <div className="space-y-4 text-lg leading-relaxed text-white/80">
                {c.description.split(/\n\n+/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : (
              <p className="text-white/60">Описание кейса скоро появится.</p>
            )}
          </article>

          <aside className="h-fit">
            <div className="card p-6 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/50">Направление</div>
                <div className="mt-1 font-medium">{dir?.title || c.direction}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/50">Тип работы</div>
                <div className="mt-1 font-medium">{c.type_title}</div>
              </div>
              {c.link_url && (
                <div className="pt-2">
                  <a
                    href={c.link_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-primary w-full"
                  >
                    Перейти на сайт →
                  </a>
                  <p className="mt-2 text-xs text-white/40">
                    Откроется в новой вкладке: {new URL(c.link_url).hostname}
                  </p>
                </div>
              )}
              <div className="pt-2">
                <Link href="/#contact" className="btn-ghost w-full">
                  Обсудить похожий проект
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && dir && (
        <section className="border-t border-white/10 bg-graphite/30">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl md:text-4xl">Ещё в направлении {dir.title}</h2>
              <Link href={`/services/${dir.slug}`} className="btn-ghost">
                Все кейсы направления →
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/cases/${r.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-graphite/40 transition hover:border-ember/50"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={r.image_url}
                      alt={r.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="space-y-2 p-5">
                    <span className="chip">{r.type_title}</span>
                    <h3 className="font-display text-xl">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
